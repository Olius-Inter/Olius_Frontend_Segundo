import type { ManagedUser } from '../../auth/contracts'
import { coreRequest } from '../../../shared/api/coreClient'
import { isUuid } from '../../../shared/lib/isUuid'
import { readManagedUser } from '../../auth'

export async function getManagedUser(id: string, signal: AbortSignal): Promise<ManagedUser> {
  try {
    if (!isUuid(id)) throw new Error('Informe um identificador UUID válido.')
    return readManagedUser(
      await (await coreRequest(`/api/v1/users/${encodeURIComponent(id)}`, { signal })).json(),
    )
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar a conta.')
  }
}
export async function setManagedUserStatus(
  id: string,
  status: ManagedUser['status'],
  signal: AbortSignal,
): Promise<void> {
  try {
    if (!isUuid(id) || !['ACTIVE', 'INACTIVE'].includes(status))
      throw new Error('Conta ou situação inválida.')
    await coreRequest(`/api/v1/admin/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  } catch (error: unknown) {
    throw error instanceof Error
      ? error
      : new Error('Não foi possível alterar a situação da conta.')
  }
}
