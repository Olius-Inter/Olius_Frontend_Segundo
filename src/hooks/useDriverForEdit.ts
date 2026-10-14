import { useCallback } from 'react'
import { listDrivers } from '../services/driverService'
import { useAbortableResource } from './useAbortableResource'
import type { DriverEditState, UseDriverForEditResult } from '../types/driver'

export function useDriverForEdit(driverId: string | undefined): UseDriverForEditResult {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      if (!driverId) return undefined
      // Reutiliza o contrato existente, sem pressupor um endpoint individual.
      const drivers = await listDrivers(signal)
      return drivers.find((driver) => driver.id === driverId)
    },
    [driverId],
  )
  const { state: resource, reload } = useAbortableResource(loader)
  const state: DriverEditState =
    resource.phase === 'ready'
      ? resource.data
        ? { phase: 'ready', driver: resource.data }
        : { phase: 'not-found' }
      : resource
  return { state, retry: reload }
}
