import type {
  B2BHomeResponse,
  B2BOffersPage,
  B2BOperation,
  B2BOperationInput,
} from '../types/b2bHome'
import { validateB2BHome, validateB2BOffers } from '../validation/validateB2BHome'

export class B2BServiceError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'B2BServiceError'
    this.status = status
  }
}

export const b2bEndpoints = {
  home: import.meta.env.VITE_B2B_HOME_API_URL as string | undefined,
  offers: import.meta.env.VITE_B2B_OFFERS_API_URL as string | undefined,
  register: import.meta.env.VITE_B2B_REGISTER_OIL_API_URL as string | undefined,
  request: import.meta.env.VITE_B2B_REQUEST_COLLECTION_API_URL as string | undefined,
}

function apiError(status: number): B2BServiceError {
  const message =
    status === 401
      ? 'Sua sessão expirou. Entre novamente para continuar.'
      : status === 403
        ? 'Você não tem autorização para esta operação.'
        : status === 409
          ? 'Os dados mudaram. A oferta pode ter sido aceita por outro coletor; confira a lista atualizada.'
          : status === 422
            ? 'A operação não atende às regras vigentes. Confira os dados e atualize o painel.'
            : 'Não foi possível concluir a operação. Tente novamente.'
  return new B2BServiceError(message, status)
}

function normalizeError(error: unknown, signal?: AbortSignal): Error {
  if (signal?.aborted && error instanceof Error) return error
  if (error instanceof B2BServiceError) return error
  if (error instanceof TypeError)
    return new Error('Não foi possível conectar ao Olius. Confira sua conexão.', { cause: error })
  if (error instanceof SyntaxError)
    return new Error('Os dados recebidos do Olius estão em um formato inválido.', { cause: error })
  return error instanceof Error
    ? error
    : new Error('Não foi possível carregar os dados do estabelecimento.', { cause: error })
}

export async function getB2BHome(signal: AbortSignal): Promise<B2BHomeResponse> {
  try {
    if (!b2bEndpoints.home) return { kind: 'not-configured' }
    const response = await fetch(b2bEndpoints.home, {
      signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (response.status === 401) return { kind: 'unauthenticated' }
    if (response.status === 403) return { kind: 'forbidden' }
    if (!response.ok) throw apiError(response.status)
    const payload: unknown = await response.json()
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'user' in payload &&
      typeof payload.user === 'object' &&
      payload.user !== null &&
      'accountType' in payload.user &&
      payload.user.accountType !== 'B2B'
    )
      return { kind: 'forbidden' }
    if (!validateB2BHome(payload))
      throw new Error('O painel recebeu dados incompatíveis com o contrato B2B.')
    if (!payload.user.active) return { kind: 'forbidden' }
    return { kind: 'ready', data: payload }
  } catch (error: unknown) {
    throw normalizeError(error, signal)
  }
}

export async function getB2BOffers(
  establishmentId: string,
  signal: AbortSignal,
  limit = 3,
): Promise<B2BOffersPage> {
  try {
    if (!b2bEndpoints.offers)
      throw new Error('A consulta de coletas disponíveis ainda não está disponível.')
    const url = new URL(b2bEndpoints.offers, window.location.origin)
    url.searchParams.set('establishmentId', establishmentId)
    url.searchParams.set('limit', String(limit))
    const response = await fetch(url, {
      signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) throw apiError(response.status)
    const payload: unknown = await response.json()
    if (!validateB2BOffers(payload))
      throw new Error('A lista de coletas recebida está em um formato inválido.')
    return payload
  } catch (error: unknown) {
    throw normalizeError(error, signal)
  }
}

export async function submitB2BOperation(
  operation: B2BOperation,
  input: B2BOperationInput,
  signal: AbortSignal,
  key: string,
): Promise<void> {
  try {
    const endpoint = operation === 'register' ? b2bEndpoints.register : b2bEndpoints.request
    if (!endpoint) throw new Error('Esta operação ainda não está disponível.')
    if (!Number.isFinite(input.liters) || input.liters <= 0)
      throw new Error('Informe um volume válido.')
    const response = await fetch(endpoint, {
      method: 'POST',
      signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw apiError(response.status)
  } catch (error: unknown) {
    throw normalizeError(error, signal)
  }
}

export async function respondB2BOffer(
  id: string,
  action: 'accept' | 'decline',
  establishmentId: string,
  signal: AbortSignal,
  key: string,
): Promise<void> {
  try {
    if (!b2bEndpoints.offers) throw new Error('Esta operação ainda não está disponível.')
    const url = new URL(b2bEndpoints.offers, window.location.origin)
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(id)}/${action}`
    url.search = ''
    const response = await fetch(url, {
      method: 'POST',
      signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ establishmentId }),
    })
    if (!response.ok) throw apiError(response.status)
  } catch (error: unknown) {
    throw normalizeError(error, signal)
  }
}
