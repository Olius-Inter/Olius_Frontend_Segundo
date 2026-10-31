import type { AbortableResourceResult } from '../api'
import type { AdminFilters } from '../admin-records/admin'
import type { AdminResult } from '../result'
import type { AnalyticsReport } from './analytics'

export interface AdminReportsQueryResult
  extends AbortableResourceResult<AdminResult<AnalyticsReport>> {
  filters: AdminFilters
  changeFilters: (patch: Partial<AdminFilters>) => void
  result: AdminResult<AnalyticsReport> | null
  data: AnalyticsReport | null
}
