import { coreRequest } from '../coreClient'
import { isUuid } from '../../utils/isUuid'
import type { PendingPev, PendingPevPage, PevDecision, PevOwnerType } from '../../types/pev/pev'

const endpoint = '/api/v1/admin/pevs'
export const pevPageSize = 10

function isPendingPev(value: unknown, ownerType: PevOwnerType): value is PendingPev {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  if (
    typeof item.id !== 'string' ||
    !isUuid(item.id) ||
    item.status !== 'PENDING' ||
    item.ownerType !== ownerType ||
    typeof item.ownerName !== 'string' ||
    !item.ownerName.trim() ||
    typeof item.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(item.createdAt)) ||
    !item.address ||
    typeof item.address !== 'object'
  )
    return false
  const address = item.address as Record<string, unknown>
  return (
    ['street', 'number', 'neighborhood', 'city', 'state', 'cep'].every(
      (field) => typeof address[field] === 'string',
    ) &&
    (address.complement === null || typeof address.complement === 'string')
  )
}

export async function listPendingPevs(
  ownerType: PevOwnerType,
  page: number,
  signal: AbortSignal,
): Promise<PendingPevPage> {
  try {
    signal.throwIfAborted()
    const query = new URLSearchParams({
      status: 'PENDING',
      ownerType,
      page: String(page),
      size: String(pevPageSize),
    })
    const response = await coreRequest(endpoint + '?' + query, { signal })
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') throw new Error('Resposta de PEVs inválida.')
    const result = data as Record<string, unknown>
    const items: unknown = result.items
    if (
      result.page !== page ||
      result.size !== pevPageSize ||
      typeof result.totalElements !== 'number' ||
      !Number.isSafeInteger(result.totalElements) ||
      result.totalElements < 0 ||
      !Array.isArray(items) ||
      items.length > pevPageSize ||
      !items.every((item) => isPendingPev(item, ownerType)) ||
      new Set(items.map((item) => item.id)).size !== items.length
    )
      throw new Error('Resposta de PEVs inválida.')
    return { items, page, size: pevPageSize, totalElements: result.totalElements }
  } catch (error: unknown) {
    throw error instanceof Error
      ? error
      : new Error('Não foi possível consultar os pedidos de PEV.')
  }
}

export async function decidePev(
  id: string,
  status: PevDecision,
  signal: AbortSignal,
): Promise<void> {
  try {
    signal.throwIfAborted()
    if (!isUuid(id)) throw new Error('Identificador de PEV inválido.')
    const response = await coreRequest(endpoint + '/' + id + '/status', {
      method: 'PATCH',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data: unknown = await response.json()
    if (
      !data ||
      typeof data !== 'object' ||
      !('id' in data) ||
      data.id !== id ||
      !('status' in data) ||
      data.status !== status
    )
      throw new Error(
        'A confirmação do servidor é inválida. Atualize a fila antes de tentar novamente.',
      )
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível registrar a decisão.')
  }
}
