import { useContext } from 'react'
import { DriversContext } from '../providers/DriversContext'
import type { UseDriversResult } from '../types/driverList'

export function useDrivers(): UseDriversResult {
  const context = useContext(DriversContext)
  if (!context) throw new Error('useDrivers deve ser usado dentro de DriversProvider.')
  return context
}
