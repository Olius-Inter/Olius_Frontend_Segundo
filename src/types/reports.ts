import type { Dispatch, ReactNode } from 'react'
import type { AbortableResourceResult } from './api'

export type ReportPeriod = 'monthly' | 'yearly'
export type PlanId = 'basic' | 'professional' | 'business'

export interface ReportPreferences {
  period: ReportPeriod
  year: number
}

export interface CollectionPoint {
  id: string
  label: string
  liters: number
}

export interface OilDestination {
  id: string
  label: string
  liters: number
}

export interface ReportData {
  source: 'demo' | 'api'
  collection: CollectionPoint[]
  destinations: OilDestination[]
  previousPeriodLiters: number | null
}

export interface ReportSummary {
  latest: CollectionPoint | null
  totalLiters: number
  growthPercent: number | null
}

export interface SubscriptionPlan {
  id: PlanId
  name: string
  description: string
  monthlyPriceCents: number
}

export type PlansState =
  | { phase: 'closed'; selectedPlan: PlanId | null; feedback: string | null }
  | { phase: 'choosing'; selectedPlan: PlanId | null; feedback: null }
  | { phase: 'error'; selectedPlan: PlanId | null; feedback: string }

export type PlansAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'choose'; plan: SubscriptionPlan }
  | { type: 'invalid'; message: string }

export interface ReportsContextValue {
  preferences: ReportPreferences
  changePreferences: (changes: Partial<ReportPreferences>) => void
  resource: AbortableResourceResult<ReportData>
  summary: ReportSummary | null
  plans: PlansState
  dispatchPlans: Dispatch<PlansAction>
  storageAvailable: boolean
}

export interface ReportsProviderProps {
  children: ReactNode
}
export interface ReportPeriodSelectorProps {
  onOpenPlans: () => void
}
export interface CollectionChartProps {
  points: CollectionPoint[]
  summary: ReportSummary
  period: ReportPeriod
}
export interface DestinationChartProps {
  destinations: OilDestination[]
}
export interface PlanCardProps {
  plan: SubscriptionPlan
  period: ReportPeriod
  selected: boolean
  onChoose: (id: PlanId) => void
}
export interface PlansDialogProps {
  open: boolean
  period: ReportPeriod
  selectedPlan: PlanId | null
  error: string | null
  onChoose: (id: PlanId) => void
  onClose: () => void
  triggerRef: { current: HTMLButtonElement | null }
}

export interface VersionedReportPreferences extends ReportPreferences {
  _versao: 1
}
