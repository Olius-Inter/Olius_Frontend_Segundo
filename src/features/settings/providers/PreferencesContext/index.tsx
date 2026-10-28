import { createContext, useEffect, useMemo, useState } from 'react'
import type {
  PortalPreferences,
  PortalProviderProps,
  PreferencesContextValue,
} from '../../types/settings'

const defaults: PortalPreferences = { _versao: 1, theme: 'light', contrast: false, reader: false }
const key = 'olius:portal-preferences'
function load(): PortalPreferences {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (
      value &&
      typeof value === 'object' &&
      '_versao' in value &&
      value._versao === 1 &&
      'theme' in value &&
      (value.theme === 'light' || value.theme === 'dark') &&
      'contrast' in value &&
      typeof value.contrast === 'boolean' &&
      'reader' in value &&
      typeof value.reader === 'boolean'
    )
      return { _versao: 1, theme: value.theme, contrast: value.contrast, reader: value.reader }
  } catch {
    /* Preferências opcionais. */
  }
  return { ...defaults }
}
export const PreferencesContext = createContext<PreferencesContextValue | null>(null)
export default function PreferencesProvider({ children }: PortalProviderProps) {
  const [preferences, setPreferences] = useState(load)
  const [storageAvailable, setStorageAvailable] = useState(true)
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    document.documentElement.dataset.contrast = preferences.contrast ? 'high' : 'normal'
    try {
      localStorage.setItem(key, JSON.stringify(preferences))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
  }, [preferences])
  const value = useMemo(
    () => ({
      preferences,
      storageAvailable,
      change: (patch: Partial<Omit<PortalPreferences, '_versao'>>) =>
        setPreferences((previous) => ({ ...previous, ...patch, _versao: 1 })),
      reset: () => setPreferences({ ...defaults }),
    }),
    [preferences, storageAvailable],
  )
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
