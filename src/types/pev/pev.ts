export type PevOwnerType = 'ESTABLISHMENT' | 'CITIZENS'
export type PevDecision = 'APPROVED' | 'REJECTED'

export interface PendingPev {
  id: string
  ownerName: string
  ownerType: PevOwnerType
  createdAt: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    cep: string
    complement: string | null
  }
}

export interface PendingPevPage {
  items: PendingPev[]
  page: number
  size: number
  totalElements: number
}

export interface PevRequestsProps {
  ownerType: PevOwnerType
}
