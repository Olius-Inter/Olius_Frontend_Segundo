import { createContext } from 'react'
import { useDriverDirectory } from '../../hooks/useDriverDirectory'
import type { DriversProviderProps, UseDriversResult } from '../../types/driverList'

export const DriversContext = createContext<UseDriversResult | null>(null)
export default function DriversProvider({ children }: DriversProviderProps) {
  const directory = useDriverDirectory()
  return <DriversContext.Provider value={directory}>{children}</DriversContext.Provider>
}
