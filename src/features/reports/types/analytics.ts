import type { AdminDashboardData } from '../../admin-records/contracts'

export interface AnalyticsQuery {
  from: string
  to: string
}
export interface AnalyticsReport {
  period: AnalyticsQuery
  generatedAt: string
  complete: boolean
  charts: AdminDashboardData['charts']
}
// Port interno de dados normalizados. O backend consulta o Databricks com suas próprias credenciais.
export interface AnalyticsGateway {
  reports?: (query: AnalyticsQuery, signal: AbortSignal) => Promise<AnalyticsReport>
}
