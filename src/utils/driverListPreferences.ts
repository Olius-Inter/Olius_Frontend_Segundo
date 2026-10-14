import type { DriverListPreferences } from '../types/driverList'

const KEY = 'olius:driver-list-preferences'
export const defaultDriverPreferences: DriverListPreferences = { status: 'ALL', sort: 'name-asc' }

export function validateDriverPreferences(value: unknown): value is DriverListPreferences {
  if (typeof value !== 'object' || value === null) return false
  const input = value as Record<string, unknown>
  return (
    (input.status === 'ALL' || input.status === 'ACTIVE' || input.status === 'INACTIVE') &&
    (input.sort === 'name-asc' || input.sort === 'name-desc')
  )
}

export function loadDriverPreferences(): DriverListPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultDriverPreferences }
    const stored: unknown = JSON.parse(raw)
    if (
      typeof stored === 'object' &&
      stored !== null &&
      '_versao' in stored &&
      stored._versao === 1 &&
      validateDriverPreferences(stored)
    ) {
      return { status: stored.status, sort: stored.sort }
    }
    localStorage.removeItem(KEY)
  } catch {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* Usar preferências em memória. */
    }
  }
  return { ...defaultDriverPreferences }
}

export function saveDriverPreferences(preferences: DriverListPreferences): boolean {
  try {
    // Somente preferências visuais; nomes digitados e documentos não são armazenados.
    localStorage.setItem(
      KEY,
      JSON.stringify({ _versao: 1, status: preferences.status, sort: preferences.sort }),
    )
    return true
  } catch {
    return false
  }
}

export function normalizeDriverSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').trim().toLocaleLowerCase('pt-BR')
}
