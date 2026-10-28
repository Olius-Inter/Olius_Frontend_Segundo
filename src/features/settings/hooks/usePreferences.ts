import { useContext } from 'react'
import { PreferencesContext } from '../providers/PreferencesContext'
export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('Use PreferencesProvider.')
  return context
}
