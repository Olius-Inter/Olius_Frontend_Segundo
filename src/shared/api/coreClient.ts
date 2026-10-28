// Transporte da Core verificado no commit 084ddb43. Access token somente em memória.
let access: { token: string; expiresAt: number } | null = null
let refreshing: Promise<void> | null = null
let epoch = 0
const invalidListeners = new Set<() => void>()
export const localDemoEnabled =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) &&
  import.meta.env.VITE_LOCAL_ADMIN_DEMO === 'true'
export const coreConfigured = Boolean(import.meta.env.VITE_API_BASE_URL)
export class CoreError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'CoreError'
    this.status = status
  }
}
export function onSessionInvalid(listener: () => void): () => void {
  invalidListeners.add(listener)
  return () => {
    invalidListeners.delete(listener)
  }
}
export function clearAccess(): void {
  epoch++
  access = null
}
function invalidate(): void {
  clearAccess()
  invalidListeners.forEach((listener) => listener())
}
function url(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) throw new CoreError('A conexão com o Olius ainda não foi configurada.', 0)
  return `${base.replace(/\/$/, '')}${path}`
}
async function checkedFetch(path: string, init: RequestInit): Promise<Response> {
  try {
    if (localDemoEnabled)
      throw new CoreError('A integração desta operação está indisponível neste ambiente.', 0)
    const response = await fetch(url(path), { ...init, cache: 'no-store' })
    if (response.ok) return response
    const messages: Record<number, string> = {
      400: 'Confira os campos informados.',
      401: 'Sua sessão expirou ou as credenciais são inválidas.',
      403: 'Sua conta não tem permissão ou a verificação de segurança foi recusada.',
      404: 'Registro não encontrado.',
      409: 'Os dados já existem ou foram alterados. Atualize antes de tentar novamente.',
      422: 'A operação não atende às regras vigentes.',
      429: 'Muitas tentativas. Aguarde antes de tentar novamente.',
      503: 'O serviço está indisponível. Tente novamente mais tarde.',
    }
    // Não copiar mensagens arbitrárias do servidor, tokens ou informações SQL para a UI/log.
    throw new CoreError(
      messages[response.status] ?? 'Não foi possível concluir a operação.',
      response.status,
    )
  } catch (error: unknown) {
    if (error instanceof TypeError)
      throw new CoreError('Não foi possível conectar ao Olius. Confira sua conexão.', 0)
    throw error
  }
}
async function csrf(): Promise<Record<string, string>> {
  const response = await checkedFetch('/api/v1/auth/web/csrf', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  const value: unknown = await response.json()
  if (
    !value ||
    typeof value !== 'object' ||
    !('headerName' in value) ||
    !('token' in value) ||
    value.headerName !== 'X-XSRF-TOKEN' ||
    typeof value.token !== 'string' ||
    !value.token
  )
    throw new CoreError('Resposta de segurança inválida.', 0)
  return { [value.headerName]: value.token }
}
async function webPost(path: string, body?: unknown): Promise<Response> {
  return checkedFetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(await csrf()) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}
async function acceptAccess(response: Response, expectedEpoch: number): Promise<void> {
  const value: unknown = await response.json()
  if (
    !value ||
    typeof value !== 'object' ||
    !('accessToken' in value) ||
    typeof value.accessToken !== 'string' ||
    !value.accessToken ||
    !('tokenType' in value) ||
    value.tokenType !== 'Bearer' ||
    !('expiresAt' in value) ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.expiresAt)) ||
    Date.parse(value.expiresAt) <= Date.now()
  )
    throw new CoreError('Resposta de autenticação inválida.', 0)
  if (epoch !== expectedEpoch) throw new CoreError('A sessão foi encerrada.', 401)
  access = { token: value.accessToken, expiresAt: Date.parse(value.expiresAt) }
}
export async function coreLogin(input: { email: string; password: string }): Promise<void> {
  clearAccess()
  const expected = epoch
  await acceptAccess(await webPost('/api/v1/auth/web/login', input), expected)
}
export async function refreshAccess(): Promise<void> {
  if (refreshing) return refreshing
  const expected = epoch
  const run = async () => acceptAccess(await webPost('/api/v1/auth/web/refresh'), expected)
  // A rotação não admite reutilização. Coordenar abas da mesma origem quando disponível.
  refreshing = (navigator.locks ? navigator.locks.request('olius-core-refresh', run) : run())
    .catch((error: unknown) => {
      if (error instanceof CoreError && (error.status === 401 || error.status === 403)) invalidate()
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}
export async function coreRequest(path: string, init: RequestInit = {}): Promise<Response> {
  if (!path.startsWith('/api/v1/')) throw new CoreError('Caminho da Core inválido.', 0)
  const send = async () =>
    checkedFetch(path, {
      ...init,
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        ...init.headers,
        Authorization: `Bearer ${access?.token ?? ''}`,
      },
    })
  try {
    if (!access || access.expiresAt <= Date.now() + 5000) await refreshAccess()
    try {
      return await send()
    } catch (error: unknown) {
      if (!(error instanceof CoreError) || error.status !== 401) throw error
      await refreshAccess()
      if (init.method && init.method !== 'GET')
        throw new CoreError('Sessão renovada. Confira os dados e envie novamente.', 409)
      return await send()
    }
  } catch (error: unknown) {
    if (error instanceof CoreError && error.status === 401) invalidate()
    throw error
  }
}
export async function coreLogout(): Promise<void> {
  clearAccess()
  if (refreshing) {
    try {
      await refreshing
    } catch {
      /* Não renovar para sair. */
    }
  }
  try {
    await webPost('/api/v1/auth/web/logout')
  } finally {
    clearAccess()
  }
}
