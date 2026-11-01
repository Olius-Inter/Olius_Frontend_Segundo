import type { Driver } from '../drivers/driver'
import type { DriverListFilters } from '../drivers/driverList'

export interface ProfilerSample {
  id: string
  phase: string
  actualDuration: number
  baseDuration: number
}
export interface DriverComparisonProps {
  drivers: Driver[]
  filters: DriverListFilters
  counter: number
}
export interface DriverPreviewProps {
  id: string
  drivers: Driver[]
  onSelect: (id: string) => void
}
declare global {
  interface Window {
    oliusProfilerSamples: ProfilerSample[]
  }
}
