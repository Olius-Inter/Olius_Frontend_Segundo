import { createDemoReport } from '../data/reportDemo'
import type { ReportData, ReportPreferences } from '../types/reports'
import {
  sanitizeReportData,
  validateReportData,
  validateReportPreferences,
} from '../utils/validateReports'

export async function getReport(
  preferences: ReportPreferences,
  signal: AbortSignal,
): Promise<ReportData> {
  try {
    if (!validateReportPreferences(preferences))
      throw new Error('Selecione um período e um ano válidos.')
    signal.throwIfAborted()
    // A URL completa será definida após confirmar o contrato do backend.
    const endpoint = import.meta.env.VITE_REPORTS_API_URL
    if (!endpoint) {
      await new Promise<void>((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(timer)
          reject(signal.reason)
        }
        const timer = setTimeout(() => {
          signal.removeEventListener('abort', onAbort)
          resolve()
        }, 300)
        signal.addEventListener('abort', onAbort, { once: true })
      })
      signal.throwIfAborted()
      return createDemoReport(preferences)
    }
    const url = new URL(endpoint, window.location.origin)
    url.searchParams.set('period', preferences.period)
    url.searchParams.set('year', String(preferences.year))
    const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok)
      throw new Error(`Não foi possível consultar os relatórios (HTTP ${response.status}).`)
    const payload: unknown = await response.json()
    if (!validateReportData(payload))
      throw new Error('Os dados de relatório recebidos estão em um formato inválido.')
    return { ...sanitizeReportData(payload), source: 'api' }
  } catch (error: unknown) {
    if (signal.aborted) throw error
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de relatórios.', { cause: error })
    if (error instanceof SyntaxError)
      throw new Error('O serviço de relatórios retornou um JSON inválido.', { cause: error })
    if (error instanceof Error) throw error
    throw new Error('Não foi possível carregar os relatórios.', { cause: error })
  }
}
