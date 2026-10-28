export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
export type InvitationAction = 'RESEND' | 'REVOKE'
export interface AdminInvitation {
  id: string
  name: string
  email: string
  status: InvitationStatus
  expiresAt: string | null
  allowedActions: InvitationAction[]
}
export interface AdminInvitationInput {
  name: string
  email: string
}
export interface InvitationQuery {
  page: number
  pageSize: 10
}
export interface InvitationPage {
  items: AdminInvitation[]
  total: number
  totalPages: number
}
export interface InvitationPreview {
  name: string
  email: string
  status: InvitationStatus
  expiresAt: string | null
}
export interface InvitationAcceptanceInput {
  token: string
  password: string
}
export interface InvitationPasswordValues {
  password: string
  confirmation: string
}
// Portas internas: os endpoints e DTOs HTTP ainda precisam ser homologados.
export interface AdminInvitationGateway {
  list?: (query: InvitationQuery, signal: AbortSignal) => Promise<InvitationPage>
  create?: (input: AdminInvitationInput, signal: AbortSignal) => Promise<AdminInvitation>
  resend?: (id: string, signal: AbortSignal) => Promise<AdminInvitation>
  revoke?: (id: string, signal: AbortSignal) => Promise<AdminInvitation>
  inspect?: (token: string, signal: AbortSignal) => Promise<InvitationPreview>
  accept?: (input: InvitationAcceptanceInput, signal: AbortSignal) => Promise<void>
}
export interface InvitationFormProps {
  values: AdminInvitationInput
  onChange: (values: AdminInvitationInput) => void
  onSubmit: () => void
  busy: boolean
  available: boolean
  error: string
}
export interface InvitationTableProps {
  items: AdminInvitation[]
  busy: boolean
  canResend: boolean
  canRevoke: boolean
  onAction: (invitation: AdminInvitation, action: InvitationAction) => void
}
export interface DemoInvitationRecord {
  invitation: AdminInvitation
  token: string
}
