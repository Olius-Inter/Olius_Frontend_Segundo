import type { HistoryApiStatus, HistoryQuery, HistoryStatus } from '../types/history'

export const historyLabels: Record<HistoryStatus, string> = {
  ALL: 'Todos',
  REGISTERED: 'Registrado',
  PENDING: 'Pendente',
  COLLECTED: 'Coletado',
  PROCESSED: 'Processado',
}
export function historyVisualStatus(status: HistoryApiStatus): Exclude<HistoryStatus, 'ALL'> {
  return status === 'APPROVED' || status === 'ASSIGNED' || status === 'ARRIVED' ? 'PENDING' : status
}
export function validHistoryQuery(query: HistoryQuery): boolean {
  return (
    Number.isInteger(query.month) &&
    query.month >= 1 &&
    query.month <= 12 &&
    Number.isInteger(query.year) &&
    query.year >= 2000 &&
    query.year <= 2100 &&
    Number.isSafeInteger(query.page) &&
    query.page >= 1 &&
    query.page <= 100000 &&
    query.pageSize === 10 &&
    Object.hasOwn(historyLabels, query.status) &&
    (query.scope === 'own' || query.scope === 'collections')
  )
}
export function historyPeriod(query: HistoryQuery): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(query.year, query.month - 1, 1)))
}
