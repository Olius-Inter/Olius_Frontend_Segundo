import { useCallback } from 'react'
import { driverIntegrationAvailable, getDriver } from '../api/driverService'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import type { DriverEditState, UseDriverForEditResult } from '../types/driver'
import { isUuid } from '../../../shared/lib/isUuid'

export function useDriverForEdit(driverId: string | undefined): UseDriverForEditResult {
  const available = driverIntegrationAvailable()
  const loader = useCallback(
    (signal: AbortSignal) =>
      driverId && isUuid(driverId) && available
        ? getDriver(driverId, signal)
        : Promise.resolve(undefined),
    [driverId, available],
  )
  const { state: resource, reload } = useAbortableResource(loader)
  const state: DriverEditState =
    !driverId || !isUuid(driverId)
      ? { phase: 'not-found' }
      : !available
        ? { phase: 'unavailable' }
        : resource.phase === 'ready'
          ? resource.data
            ? { phase: 'ready', driver: resource.data }
            : { phase: 'not-found' }
          : resource
  return { state, retry: reload }
}
