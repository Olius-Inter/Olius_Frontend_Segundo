import { useCallback } from 'react'
import type { AdminFilters, AdminResource } from '../types/admin'
import { getAdminDetail } from '../api/adminService'
import { isUuid } from '../../../shared/lib/isUuid'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'

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
