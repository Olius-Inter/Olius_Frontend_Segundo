import { getPortalPlans } from '../../services/settings/settingsService'
import type { PortalPlansQueryResult } from '../../types/settings/queries'
import { useAbortableResource } from '../useAbortableResource'

export function usePortalPlans(): PortalPlansQueryResult {
  const resource = useAbortableResource(getPortalPlans)
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  return { ...resource, data }
}
