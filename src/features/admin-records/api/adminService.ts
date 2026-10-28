import type {
  AdminActionInput,
  AdminDetail,
  AdminFilters,
  AdminList,
  AdminResource,
} from '../types/admin'
import type { AdminResult } from '../../../shared/types/result'
import { adminGateway } from './adminGateway'
import {
  validateAdminAction,
  validateAdminFilters,
  validateAdminList,
  validateAdminDetail,
} from '../validation/adminValidation'

const pending = {
  kind: 'unavailable' as const,
  message: 'Esta consulta ainda não está disponível.',
}

export async function listAdminRecords(
  resource: AdminResource,
  filters: AdminFilters,
  signal: AbortSignal,
): Promise<AdminResult<AdminList>> {
  try {
    signal.throwIfAborted()
    if (!validateAdminFilters(filters)) throw new Error('Confira os filtros e o período.')
    const adapter = adminGateway.resources[resource]
    if (!adapter) return pending
    const data = await adapter.list(filters, signal)
    if (!validateAdminList(data, filters))
      throw new Error('A consulta administrativa retornou dados inconsistentes.')
    return { kind: 'ready', data }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar os registros.')
  }
}

export async function getAdminDetail(
  resource: AdminResource,
  id: string,
  filters: AdminFilters,
  signal: AbortSignal,
): Promise<AdminResult<AdminDetail>> {
  try {
    signal.throwIfAborted()
    const adapter = adminGateway.resources[resource]
    if (!adapter?.detail) return pending
    const data = await adapter.detail(id, filters, signal)
    if (!validateAdminDetail(data, id))
      throw new Error('O detalhe recebido está em um formato inválido.')
    return { kind: 'ready', data: { ...data, actions: adapter.act ? data.actions : [] } }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar o detalhe.')
  }
}

export async function actOnAdminRecord(
  resource: AdminResource,
  detail: AdminDetail,
  input: AdminActionInput,
  signal: AbortSignal,
): Promise<void> {
  try {
    const error = validateAdminAction(detail, input, resource)
    if (error) throw new Error(error)
    const adapter = adminGateway.resources[resource]
    if (!adapter?.act) throw new Error('Esta ação ainda não possui integração administrativa.')
    signal.throwIfAborted()
    await adapter.act(detail.id, input, signal)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível concluir a ação.')
  }
}
