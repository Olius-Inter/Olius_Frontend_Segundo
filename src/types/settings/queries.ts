import type { AbortableResourceResult } from '../api'
import type { AdminResult } from '../result'
import type { PortalPlan } from './settings'

export interface PortalPlansQueryResult extends AbortableResourceResult<AdminResult<PortalPlan[]>> {
  data: PortalPlan[] | null
}
