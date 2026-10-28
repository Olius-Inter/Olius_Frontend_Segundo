import { createContext, useContext } from 'react'
import type { ProviderProps } from '../../../shared/types/provider'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import { getPortalProfile } from '../api/settingsService'
import type { PortalProfileResource } from '../types/settings'
const Context = createContext<PortalProfileResource | null>(null)
export function usePortalProfile() {
  const value = useContext(Context)
  if (!value) throw new Error('Use PortalProvider.')
  return value
}
export default function Provider({ children }: ProviderProps) {
  const value = useAbortableResource(getPortalProfile)
  return <Context.Provider value={value}>{children}</Context.Provider>
}
