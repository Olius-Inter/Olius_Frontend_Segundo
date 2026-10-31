import { useCallback, useState } from 'react'
import { getAdminReports } from '../../services/reports/adminReportService'
import { defaultAdminFilters } from '../../utils/admin-records/adminValidation'
import type { AdminFilters } from '../../types/admin-records/admin'
import type { AdminReportsQueryResult } from '../../types/reports/query'
import { useAbortableResource } from '../useAbortableResource'

export function useAdminReports(): AdminReportsQueryResult {
  const [filters, setFilters] = useState(defaultAdminFilters)
  const loader = useCallback(
    (signal: AbortSignal) => getAdminReports({ from: filters.from, to: filters.to }, signal),
    [filters.from, filters.to],
  )
  const resource = useAbortableResource(loader)
  const result = resource.state.phase === 'ready' ? resource.state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  const changeFilters = useCallback((patch: Partial<AdminFilters>) => {
    setFilters((previous) => ({ ...previous, ...patch }))
  }, [])
  return { ...resource, filters, changeFilters, result, data }
}
