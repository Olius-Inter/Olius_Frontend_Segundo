import { useCallback, useState } from 'react'
import { getAdminDashboard } from '../../services/dashboard/dashboardService'
import { defaultAdminFilters } from '../../utils/admin-records/adminValidation'
import type { AdminFilters } from '../../types/admin-records/admin'
import type { AdminDashboardQueryResult } from '../../types/dashboard/query'
import { useAbortableResource } from '../useAbortableResource'

export function useAdminDashboard(): AdminDashboardQueryResult {
  const [filters, setFilters] = useState(defaultAdminFilters)
  const loader = useCallback((signal: AbortSignal) => getAdminDashboard(filters, signal), [filters])
  const resource = useAbortableResource(loader)
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  const changeFilters = useCallback((patch: Partial<AdminFilters>) => {
    setFilters((previous) => ({ ...previous, ...patch }))
  }, [])
  return { ...resource, filters, changeFilters, data }
}
