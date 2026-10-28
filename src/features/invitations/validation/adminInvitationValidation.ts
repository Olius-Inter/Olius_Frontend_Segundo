import type {
  AdminInvitationInput,
  InvitationPasswordValues,
  InvitationPreview,
  AdminInvitation,
  InvitationPage,
  InvitationQuery,
} from '../types/adminInvitation'
import { validatePasswordStrength } from '../../auth'
import { isUuid } from '../../../shared/lib/isUuid'

const statuses = ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED']
export const validInvitationToken = (token: string): boolean =>
  token.length > 0 && token.length <= 4096 && !/[\s\u0000-\u001f\u007f]/u.test(token)
export function validateInvitationInput(input: AdminInvitationInput): string | null {
  if (
    !input.name.trim() ||
    input.name.trim().length > 150 ||
    /[\u0000-\u001f\u007f]/.test(input.name)
  )
    return 'Informe o nome, com até 150 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.trim().length > 255)
    return 'Informe um e-mail válido.'
  return null
}
export function validateInvitationPasswords(values: InvitationPasswordValues): string | null {
  const error = validatePasswordStrength(values.password)
  if (error) return error
  return values.password === values.confirmation ? null : 'A confirmação deve ser igual à senha.'
}
export function readInvitationToken(search: string, hash: string): string {
  const values = [
    ...new URLSearchParams(search).getAll('token'),
    ...new URLSearchParams(hash.replace(/^#/, '')).getAll('token'),
  ]
  return values.length === 1 && validInvitationToken(values[0]) ? values[0] : ''
}
export function validInvitationPreview(value: unknown): value is InvitationPreview {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return (
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    !validateInvitationInput({ name: data.name, email: data.email }) &&
    statuses.includes(String(data.status)) &&
    (data.expiresAt === null ||
      (typeof data.expiresAt === 'string' && Number.isFinite(Date.parse(data.expiresAt))))
  )
}
export function validAdminInvitation(value: unknown): value is AdminInvitation {
  if (
    !validInvitationPreview(value) ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !isUuid(value.id) ||
    !('allowedActions' in value) ||
    !Array.isArray(value.allowedActions)
  )
    return false
  return (
    new Set(value.allowedActions).size === value.allowedActions.length &&
    value.allowedActions.every((action) => action === 'RESEND' || action === 'REVOKE') &&
    (!['ACCEPTED', 'REVOKED'].includes(value.status) || value.allowedActions.length === 0)
  )
}
export function validInvitationPage(
  value: unknown,
  query: InvitationQuery,
): value is InvitationPage {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return (
    Array.isArray(data.items) &&
    data.items.every(validAdminInvitation) &&
    new Set(data.items.map((item) => item.id)).size === data.items.length &&
    data.items.length <= query.pageSize &&
    Number.isSafeInteger(data.total) &&
    Number(data.total) >= data.items.length &&
    data.totalPages === Math.ceil(Number(data.total) / query.pageSize)
  )
}
