import { useCallback, useEffect, useMemo, useState } from 'react'
import { listDrivers } from '../api/driverService'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import {
  defaultDriverPreferences,
  loadDriverPreferences,
  normalizeDriverSearch,
  saveDriverPreferences,
  validateDriverPreferences,
} from '../lib/driverListPreferences'
import type { DriverListFilters, DriversListState, UseDriversResult } from '../types/driverList'

export function useDriverDirectory(): UseDriversResult {
  const [filters, updateFilters] = useState<DriverListFilters>(() => ({
    name: '',
    ...loadDriverPreferences(),
  }))
  const [storageAvailable, setStorageAvailable] = useState(true)
  // Filtros são locais: não devem repetir a consulta ao backend.
  const loader = useCallback((signal: AbortSignal) => listDrivers(signal), [])
  const { state: resource, reload } = useAbortableResource(loader)
  const drivers = resource.phase === 'ready' ? resource.data : null
  // Filtragem e ordenação não são refeitas quando só o aviso de armazenamento muda.
  const visibleDrivers = useMemo(() => {
    if (!drivers) return []
    const query = normalizeDriverSearch(filters.name)
    return drivers
      .filter(
        (driver) =>
          (filters.status === 'ALL' || driver.status === filters.status) &&
          normalizeDriverSearch(driver.name).includes(query),
      )
      .sort((left, right) => {
        const comparison =
          left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }) ||
          left.id.localeCompare(right.id)
        return filters.sort === 'name-desc' ? -comparison : comparison
      })
  }, [drivers, filters])

  useEffect(() => {
    setStorageAvailable(saveDriverPreferences({ status: filters.status, sort: filters.sort }))
  }, [filters.status, filters.sort])

  const setFilters = useCallback((changes: Partial<DriverListFilters>) => {
    updateFilters((previous) => {
      const next = { ...previous, ...changes }
      if (!validateDriverPreferences(next) || typeof next.name !== 'string') return previous
      next.name = next.name
        .normalize('NFC')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .slice(0, 120)
      return next
    })
  }, [])

  const resetFilters = useCallback(
    () => updateFilters({ name: '', ...defaultDriverPreferences }),
    [],
  )
  const state: DriversListState =
    resource.phase === 'ready' ? { phase: 'ready', drivers: visibleDrivers } : resource
  return {
    state,
    retry: reload,
    filters,
    setFilters,
    resetFilters,
    total: drivers?.length ?? 0,
    storageAvailable,
  }
}
