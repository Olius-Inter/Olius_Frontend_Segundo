import { useCallback } from 'react'
import type { AdminFilters, AdminResource } from '../../types/admin-records/admin'
import { getAdminDetail } from '../../services/admin-records/adminService'
import { isUuid } from '../../utils/isUuid'
import { useAbortableResource } from '../useAbortableResource'

export function useAdminDetail(resource: AdminResource, id: string, filters: AdminFilters) {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      if (!isUuid(id)) throw new Error('Identificador inválido.')
      return getAdminDetail(resource, id, filters, signal)
    },
    [resource, id, filters],
  )
  return useAbortableResource(loader)
}
