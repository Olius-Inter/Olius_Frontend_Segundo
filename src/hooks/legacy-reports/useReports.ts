import { useContext } from 'react'
import { ReportsContext } from '../../contexts/ReportsContext'
import type { ReportsContextValue } from '../../types/legacy-reports/reports'

export function useReports(): ReportsContextValue {
  const context = useContext(ReportsContext)
  if (!context) throw new Error('useReports deve ser utilizado dentro de ReportsProvider.')
  return context
}
