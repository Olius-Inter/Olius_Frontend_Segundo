import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AdminFilters, AdminResource } from '../types/admin'
import { defaultAdminFilters, validateAdminFilters } from '../validation/adminValidation'
import { listAdminRecords } from '../api/adminService'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import { adminResources } from '../data/adminResources'

export function useAdminRecords(resource: AdminResource) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterSearch = new URLSearchParams(searchParams)
  filterSearch.delete('registro')
  const serialized = filterSearch.toString()
  const defaults = useMemo(defaultAdminFilters, [])
  const filters = useMemo(() => {
    const params = new URLSearchParams(serialized)
    const candidate = {
      ...defaults,
      search: params.get('busca') ?? '',
      status: params.get('status') ?? '',
      from: params.get('from') ?? defaults.from,
      to: params.get('to') ?? defaults.to,
      page: Number(params.get('page') ?? 1),
      year: Number(params.get('year') ?? defaults.year),
      audience: (params.get('audience') ?? defaults.audience) as AdminFilters['audience'],
    }
    return validateAdminFilters(candidate) &&
      (!candidate.status || adminResources[resource].statuses.includes(candidate.status))
      ? candidate
      : defaults
  }, [serialized, defaults, resource])
  const loader = useCallback(
    (signal: AbortSignal) => listAdminRecords(resource, filters, signal),
    [resource, filters],
  )
  const result = useAbortableResource(loader)
  const change = (patch: Partial<AdminFilters>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    if (!validateAdminFilters(next)) return
    const params = new URLSearchParams(serialized)
    for (const [key, value] of Object.entries(next))
      params.set(key === 'search' ? 'busca' : key, String(value))
    setSearchParams(params)
  }
  return { filters, change, ...result }
}
