import type { B2BImpact } from './b2bHome'

export type HistoryStatus = 'ALL' | 'REGISTERED' | 'PENDING' | 'COLLECTED' | 'PROCESSED'
export type HistoryApiStatus = Exclude<HistoryStatus, 'ALL'> | 'APPROVED' | 'ASSIGNED' | 'ARRIVED'
export type HistoryScope = 'own' | 'collections'
export interface HistoryQuery {
  month: number
  year: number
  status: HistoryStatus
  page: number
  pageSize: number
  scope: HistoryScope
}
export interface HistoryRecord {
  id: string
  date: string
  status: HistoryApiStatus
  estimatedLiters: number | null
  confirmedLiters: number | null
}
export interface HistoryData {
  establishment: { id: string; name: string }
  allowedScopes: HistoryScope[]
  query: HistoryQuery
  items: HistoryRecord[]
  total: number
  periodTotal: number
  totalPages: number
  impact: B2BImpact
}
export type HistoryResponse =
  | { kind: 'ready'; data: HistoryData }
  | { kind: 'not-configured' | 'unauthenticated' | 'forbidden' }
export interface HistoryFiltersProps {
  query: HistoryQuery
  onChange: (patch: Partial<HistoryQuery>) => void
}
export interface HistoryTableProps {
  records: HistoryRecord[]
}
export interface HistoryRowProps {
  record: HistoryRecord
}
export interface HistoryStatusBadgeProps {
  status: HistoryApiStatus
}
export interface HistoryPaginationProps {
  page: number
  totalPages: number
  total: number
  onChange: (page: number) => void
}
