import type { ReactNode } from 'react'

export type AdminArea = 'operacao' | 'cadastros' | 'comercial' | 'resultados' | 'administracao'

export type AdminResource =
  | 'requests'
  | 'agenda'
  | 'collections'
  | 'drivers'
  | 'establishments'
  | 'pevs'
  | 'plans'
  | 'subscriptions'
  | 'charges'
  | 'payments'
  | 'refunds'
  | 'reports'
  | 'certificates'
  | 'admins'
  | 'audit'

export type AdminScalar = string | number | boolean | null

export interface AdminFilters {
  search: string
  status: string
  from: string
  to: string
  page: number
  pageSize: number
  audience: 'ESTABLISHMENT'
  year: number
}

export interface AdminColumn {
  key: string
  label: string
  format?: 'date' | 'liters' | 'money' | 'number' | 'status'
}

export interface AdminResourceConfig {
  id: AdminResource
  title: string
  description: string
  columns: AdminColumn[]
  statuses: string[]
  source: string
}

export interface AdminRecord {
  request?: CollectionRequestListDetails
  id: string
  title: string
  cells: Record<string, AdminScalar>
}

export interface AdminList {
  items: AdminRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type AdminAction =
  | 'approve'
  | 'reject'
  | 'restore'
  | 'reschedule'
  | 'cancel'
  | 'activate'
  | 'inactivate'
  | 'correct'
  | 'annul'

export interface CollectionRequestDetails {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  scheduledAt: string | null
  telephone: string | null
  email: string | null
}

export interface CollectionRequestListDetails extends CollectionRequestDetails {
  revision: number
  actions: AdminAction[]
}

export interface PendingRequestCardProps {
  record: AdminRecord
}

export interface PendingRequestListProps {
  records: AdminRecord[]
  total: number
}

export type CollectionRequestAction = Extract<
  AdminAction,
  'approve' | 'reject' | 'restore' | 'reschedule'
>

export interface AdminDetail {
  request?: CollectionRequestDetails
  id: string
  title: string
  revision: number | null
  sections: {
    title: string
    fields: { label: string; value: AdminScalar; format?: AdminColumn['format'] }[]
  }[]
  history: { id: string; date: string; author: string; description: string }[]
  actions: AdminAction[]
}

export interface AdminActionInput {
  action: AdminAction
  reason?: string
  scheduledAt?: string
  agreedAt?: string
  expectedRevision?: number
  changes?: Record<string, string>
}

export interface AdminResourceAdapter {
  list: (filters: AdminFilters, signal: AbortSignal) => Promise<AdminList>
  detail?: (id: string, filters: AdminFilters, signal: AbortSignal) => Promise<AdminDetail>
  act?: (id: string, input: AdminActionInput, signal: AbortSignal) => Promise<void>
}

export interface AdminDashboardData {
  metrics: { id: string; label: string; value: number | null; unit: 'L' | 'count'; href: string }[]
  charts: {
    id: string
    title: string
    unit: 'L' | 'count'
    values: { id: string; label: string; value: number }[]
  }[]
}

export interface AdminGateway {
  resources: Partial<Record<AdminResource, AdminResourceAdapter>>
  dashboard?: (filters: AdminFilters, signal: AbortSignal) => Promise<AdminDashboardData>
}

export interface AdminTabsProps {
  area: AdminArea
}

export interface AdminFiltersProps {
  hideSearch?: boolean
  value: AdminFilters
  statuses: string[]
  onChange: (changes: Partial<AdminFilters>) => void
}

export interface AdminTableProps {
  config: AdminResourceConfig
  records: AdminRecord[]
  onView: (id: string) => void
}

export interface AdminPaginationProps {
  data: AdminList
  onChange: (page: number) => void
}

export interface AdminActionFormProps {
  resource: AdminResource
  detail: AdminDetail
  onSaved: () => void
  onRefresh?: () => void
  onBusyChange?: (busy: boolean) => void
}

export interface AdminChartProps {
  chart: AdminDashboardData['charts'][number]
}

export interface AdminPanelProps {
  children: ReactNode
}

export interface AdminResourceListProps {
  resource: AdminResource
}

export interface AdminActionValues {
  action: AdminAction
  reason: string
  scheduledAt: string
  agreedAt: string
}

export interface AdminRecordDialogProps {
  resource: AdminResource
  id: string
  filters: AdminFilters
  onClose: () => void
  onSaved: () => void
}

export interface CollectionRequestContactProps {
  request: CollectionRequestDetails | undefined
}
