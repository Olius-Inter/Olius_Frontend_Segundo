import type { AdminFilters, AdminResource } from '../types/admin'

export function requestListScope(
  resource: AdminResource,
  params: URLSearchParams,
): Pick<AdminFilters, 'status' | 'from' | 'to'> | null {
  if (resource !== 'requests') return null
  return { status: params.get('tipo') === 'rejeitadas' ? 'REJECTED' : 'PENDING', from: '', to: '' }
}
