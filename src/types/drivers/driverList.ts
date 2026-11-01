import type { Driver, DriverStatus } from './driver'
import type { ReactNode } from 'react'

export interface DriverTableProps {
  drivers: Driver[]
}

export interface DriverRowProps {
  driver: Driver
}

export interface DriverStatusBadgeProps {
  status: DriverStatus
}

export type DriversListState =
  | { phase: 'loading' }
  | { phase: 'ready'; drivers: Driver[] }
  | { phase: 'error'; message: string }

export type DriverStatusFilter = DriverStatus | 'ALL'
export type DriverSort = 'name-asc' | 'name-desc'
export interface DriverListPreferences {
  status: DriverStatusFilter
  sort: DriverSort
}
export interface DriverListFilters extends DriverListPreferences {
  name: string
}
export interface DriversProviderProps {
  children: ReactNode
}

export interface UseDriversResult {
  state: DriversListState
  retry: () => void
  filters: DriverListFilters
  setFilters: (changes: Partial<DriverListFilters>) => void
  resetFilters: () => void
  total: number
  storageAvailable: boolean
}
