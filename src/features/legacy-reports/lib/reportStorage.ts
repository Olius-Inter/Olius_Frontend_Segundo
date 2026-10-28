import type { ReportPreferences, VersionedReportPreferences } from '../types/reports'
import { validateReportPreferences } from '../validation/validateReports'

const KEY = 'olius:report-preferences'
export function loadReportPreferences(): ReportPreferences {
  const fallback: ReportPreferences = { period: 'monthly', year: new Date().getFullYear() }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const stored: unknown = JSON.parse(raw)
    if (
      typeof stored === 'object' &&
      stored !== null &&
      '_versao' in stored &&
      stored._versao === 1 &&
      validateReportPreferences(stored)
    ) {
      return { period: stored.period, year: stored.year }
    }
    localStorage.removeItem(KEY)
  } catch {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* Armazenamento indisponível: usar estado em memória. */
    }
  }
  return fallback
}

export function saveReportPreferences(preferences: ReportPreferences): boolean {
  try {
    const stored: VersionedReportPreferences = { _versao: 1, ...preferences }
    localStorage.setItem(KEY, JSON.stringify(stored))
    return true
  } catch {
    return false
  }
}
