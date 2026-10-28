import type { ReactNode } from 'react'

export interface B2BUser {
  id: string
  name: string
  accountType: 'B2B'
  active: boolean
}
export interface B2BEstablishment {
  id: string
  name: string
}
export interface B2BImpact {
  collectedLiters: number | null
  preservedWaterLiters: number | null
  avoidedCo2Kg: number | null
  confirmedBiodieselLiters: number | null
}
export interface B2BOilStock {
  storedLiters: number | null
  reservedLiters: number | null
  availableLiters: number | null
  minimumCollectionLiters: number | null
  canRequestCollection: boolean
  blockedReason: string | null
}
export type B2BRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'ARRIVED'
  | 'COLLECTED'
  | 'REJECTED'
  | 'CANCELLED'
export interface B2BOwnRequest {
  id: string
  estimatedLiters: number
  createdAt: string
  status: B2BRequestStatus
}
export interface B2BCollectorAuthorization {
  id: string
  establishmentId: string
  kind: 'ESTABLISHMENT'
  status: 'PENDING' | 'APPROVED' | 'INACTIVE' | 'REJECTED'
  active: boolean
  validFrom: string | null
  validUntil: string | null
  canViewOffers: boolean
  canAcceptOffers: boolean
}
export interface B2BSustainability {
  levelLabel: string
  progressLiters: number
  nextLevelLiters: number
}
export interface B2BHomeData {
  user: B2BUser
  establishment: B2BEstablishment
  periodLabel: string
  impact: B2BImpact
  oilStock: B2BOilStock
  canRegisterOil: boolean
  requests: B2BOwnRequest[]
  requestCount: number
  collector: B2BCollectorAuthorization | null
  sustainability: B2BSustainability | null
}
export type B2BHomeResponse =
  | { kind: 'not-configured' }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'ready'; data: B2BHomeData }

export interface B2BOffer {
  id: string
  establishmentName: string
  regionLabel: string
  estimatedLiters: number
  windowStart: string
  windowEnd: string
  expiresAt: string | null
}
export interface B2BOffersPage {
  items: B2BOffer[]
  total: number
}
export type B2BHomeTab = 'own' | 'offers'
export type B2BOperation = 'register' | 'request'
export interface B2BOperationValues {
  liters: string
  windowStart: string
  windowEnd: string
}
export type B2BOperationErrors = Partial<Record<keyof B2BOperationValues, string>>
export interface B2BOperationInput {
  establishmentId: string
  liters: number
  windowStart?: string
  windowEnd?: string
}
export interface B2BHomeHeaderProps {
  data: B2BHomeData | null
  registerEnabled: boolean
  requestEnabled: boolean
  onOperation: (operation: B2BOperation) => void
}
export interface B2BHomeTabsProps {
  active: B2BHomeTab
  showOffers: boolean
  onChange: (tab: B2BHomeTab) => void
}
export interface B2BImpactCardsProps {
  impact: B2BImpact | null
  periodLabel: string | null
}
export interface B2BOilStockProps {
  stock: B2BOilStock | null
}
export interface B2BOwnRequestsProps {
  requests: B2BOwnRequest[]
  total: number
  connected: boolean
}
export interface B2BSustainabilityProps {
  sustainability: B2BSustainability | null
}
export interface B2BHomeFeedback {
  message: string
  kind: 'success' | 'error'
}
export interface B2BOffersProps {
  data: B2BHomeData
  onChanged: (feedback: B2BHomeFeedback) => void
}
export interface B2BOperationDialogProps {
  operation: B2BOperation | null
  data: B2BHomeData | null
  onClose: () => void
  onSuccess: (message: string) => void
  onAuthorizationLost: (feedback: B2BHomeFeedback) => void
  triggerRef: { current: HTMLButtonElement | null }
}
export interface B2BHomeNoticeProps {
  children: ReactNode
  kind?: 'info' | 'error' | 'success'
}
