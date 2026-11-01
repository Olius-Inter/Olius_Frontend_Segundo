import { createContext, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useAbortableResource } from '../../hooks/useAbortableResource'
import { getReport } from '../../services/legacy-reports/reportService'
import { initialPlansState, plansReducer } from '../../reducers/legacy-reports/plansReducer'
import {
  loadReportPreferences,
  saveReportPreferences,
} from '../../utils/legacy-reports/reportStorage'
import { summarizeReport } from '../../utils/legacy-reports/reportFormatting'
import { validateReportPreferences } from '../../utils/legacy-reports/validateReports'
import type {
  ReportPreferences,
  ReportsContextValue,
  ReportsProviderProps,
} from '../../types/legacy-reports/reports'

export const ReportsContext = createContext<ReportsContextValue | null>(null)

export default function ReportsProvider({ children }: ReportsProviderProps) {
  const [preferences, setPreferences] = useState(loadReportPreferences)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [plans, dispatchPlans] = useReducer(plansReducer, initialPlansState)
  // Mantém o loader estável ao abrir planos; consultas só mudam com os filtros.
  const loader = useCallback((signal: AbortSignal) => getReport(preferences, signal), [preferences])
  const resource = useAbortableResource(loader)
  const data = resource.state.phase === 'ready' ? resource.state.data : null
  // Agregações de séries não são refeitas quando o diálogo de planos muda.
  const summary = useMemo(() => (data ? summarizeReport(data) : null), [data])

  useEffect(() => {
    setStorageAvailable(saveReportPreferences(preferences))
  }, [preferences])

  const changePreferences = useCallback((changes: Partial<ReportPreferences>) => {
    setPreferences((previous) => {
      const next = { ...previous, ...changes }
      return validateReportPreferences(next) &&
        (next.period !== previous.period || next.year !== previous.year)
        ? next
        : previous
    })
  }, [])

  return (
    <ReportsContext.Provider
      value={{
        preferences,
        changePreferences,
        resource,
        summary,
        plans,
        dispatchPlans,
        storageAvailable,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}
