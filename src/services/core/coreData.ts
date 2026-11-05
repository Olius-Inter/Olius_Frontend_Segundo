import { CoreError, coreRequest } from '../coreClient'
import { isUuid } from '../../utils/isUuid'
import { validDate } from '../../utils/validDate'
import type { CorePage } from '../../types/api/core'

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Resposta da API inválida.')
  return value as Record<string, unknown>
}
export function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Texto recebido da API inválido.')
  return value
}
export function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error('Valor recebido da API inválido.')
  return value
}
export function integer(value: unknown): number {
  const result = number(value)
  if (!Number.isSafeInteger(result)) throw new Error('Contagem recebida da API inválida.')
  return result
}
export function uuid(value: unknown): string {
  const result = string(value)
  if (!isUuid(result)) throw new Error('Identificador recebido da API inválido.')
  return result
}
export function date(value: unknown): string {
  const result = string(value)
  if (!Number.isFinite(Date.parse(result))) throw new Error('Data recebida da API inválida.')
  return result
}
export function state<T extends string>(value: unknown, choices: readonly T[]): T {
  if (!choices.includes(value as T)) throw new Error('Situação recebida da API inválida.')
  return value as T
}
export const get = async (path: string, signal: AbortSignal): Promise<unknown> =>
  (await coreRequest(path, { signal })).json()
export const send = (path: string, method: string, body: unknown, signal: AbortSignal) =>
  coreRequest(path, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
export function period(from: string, to: string): URLSearchParams {
  const params = new URLSearchParams()
  if (from) {
    if (!validDate(from)) throw new Error('Data inicial inválida.')
    params.set('from', new Date(`${from}T00:00:00-03:00`).toISOString())
  }
  if (to) {
    if (!validDate(to)) throw new Error('Data final inválida.')
    const end = new Date(`${to}T00:00:00-03:00`)
    end.setUTCDate(end.getUTCDate() + 1)
    params.set('until', end.toISOString())
  }
  return params
}
export async function page(
  path: string,
  params: URLSearchParams,
  index: number,
  size: number,
  signal: AbortSignal,
): Promise<CorePage> {
  const query = new URLSearchParams(params)
  query.set('page', String(index))
  query.set('size', String(size))
  const data = object(await get(`${path}?${query}`, signal))
  const total = integer(data.totalElements)
  if (
    data.page !== index ||
    data.size !== size ||
    !Array.isArray(data.items) ||
    data.items.length !== Math.min(size, Math.max(0, total - index * size))
  )
    throw new Error('Página recebida da API inválida.')
  return { items: data.items.map(object), total }
}
// Consultas compostas não retornam uma primeira página como se fosse o conjunto completo.
export async function allPages(
  path: string,
  params: URLSearchParams,
  signal: AbortSignal,
): Promise<Record<string, unknown>[]> {
  const first = await page(path, params, 0, 100, signal)
  if (first.total > 10000)
    throw new Error(
      'A consulta excede o limite de 10.000 registros. É necessário um endpoint agregado para este volume.',
    )
  const items = [...first.items]
  for (let index = 1; index < Math.ceil(first.total / 100); index++) {
    signal.throwIfAborted()
    const next = await page(path, params, index, 100, signal)
    if (next.total !== first.total)
      throw new Error('Os dados mudaram durante a consulta. Atualize para tentar novamente.')
    items.push(...next.items)
  }
  const ids = items.map((item) => uuid(item.id))
  if (new Set(ids).size !== ids.length)
    throw new Error('A consulta retornou registros duplicados. Atualize para tentar novamente.')
  return items
}
export function noSearch(search: string): void {
  if (search.trim())
    throw new Error(
      'A busca por texto ainda não está disponível nesta consulta. Limpe o campo Buscar.',
    )
}
// Cache restrito a uma única consulta, sem persistir contatos/documentos de usuários.
export function profileLookup(signal: AbortSignal) {
  const cache = new Map<string, Promise<Record<string, unknown> | null>>()
  return (id: unknown) => {
    const key = uuid(id)
    let request = cache.get(key)
    if (!request) {
      request = get(`/api/v1/users/${key}`, signal)
        .then((value) => {
          const data = object(value)
          if (data.userType !== 'ESTABLISHMENT' || uuid(data.id) !== key)
            throw new Error('Estabelecimento recebido em formato inválido.')
          return data
        })
        .catch((error: unknown) => {
          if (error instanceof CoreError && [403, 404].includes(error.status)) return null
          throw error
        })
      cache.set(key, request)
    }
    return request
  }
}
export function address(profile: Record<string, unknown> | null): string {
  if (!profile?.address) return 'Endereço indisponível'
  const data = object(profile.address)
  return (
    ['street', 'number', 'neighborhood', 'city', 'state']
      .map((key) => data[key])
      .filter((value) => typeof value === 'string' && value)
      .join(', ') || 'Endereço indisponível'
  )
}
