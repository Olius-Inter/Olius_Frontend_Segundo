import type { AbortableResourceResult } from '../api'
import type { AdminDashboardData, AdminFilters } from '../admin-records/admin'
import type { AdminResult } from '../result'

export interface AdminDashboardQueryResult
  extends AbortableResourceResult<AdminResult<AdminDashboardData>> {
  filters: AdminFilters
  changeFilters: (patch: Partial<AdminFilters>) => void
  data: AdminDashboardData | null
}
