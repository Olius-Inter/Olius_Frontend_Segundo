export interface DemoRequest {
  id: string
  name: string
  address: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requestedAt: string
  scheduledAt: string | null
  endsAt: string | null
  estimatedLiters: number
  confirmedLiters: number | null
  revision: number
  completed: boolean
  history: { id: string; date: string; author: string; description: string }[]
}
