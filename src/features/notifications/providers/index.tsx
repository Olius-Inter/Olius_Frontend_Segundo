import { createContext, useContext } from 'react'
import type { ProviderProps } from '../../../shared/types/provider'
import { useNotifications } from '../hooks/useNotifications'

const Context = createContext<ReturnType<typeof useNotifications> | null>(null)
export function useNotificationCenter() {
  const value = useContext(Context)
  if (!value) throw new Error('Use PortalProvider.')
  return value
}
export default function Provider({ children }: ProviderProps) {
  const value = useNotifications()
  return <Context.Provider value={value}>{children}</Context.Provider>
}
