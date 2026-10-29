import type {
  AdminInvitationGateway,
  DemoInvitationRecord,
} from '../../features/invitations/types/adminInvitation'
import { demoInvitations } from './adminInvitationDemo'
const clone = <T>(value: T): T => structuredClone(value)
function current(record: DemoInvitationRecord) {
  if (
    record.invitation.status === 'PENDING' &&
    record.invitation.expiresAt &&
    Date.parse(record.invitation.expiresAt) <= Date.now()
  ) {
    record.invitation.status = 'EXPIRED'
    record.invitation.allowedActions = ['RESEND']
  }
  return record
}
function byId(id: string) {
  const record = demoInvitations.find((item) => item.invitation.id === id)
  if (!record) throw new Error('Convite não encontrado.')
  return current(record)
}
function byToken(token: string) {
  const record = demoInvitations.find((item) => item.token === token)
  if (!record)
    throw new Error('O link do convite é inválido ou foi substituído. Solicite um novo convite.')
  return current(record)
}
export function createMockAdminInvitationGateway(): AdminInvitationGateway {
  return {
    list: async (query, signal) => {
      signal.throwIfAborted()
      const all = demoInvitations.map((item) => current(item).invitation)
      return clone({
        items: all.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
        total: all.length,
        totalPages: Math.ceil(all.length / query.pageSize),
      })
    },
    create: async (input, signal) => {
      signal.throwIfAborted()
      if (
        demoInvitations.some(
          (item) =>
            item.invitation.email.toLowerCase() === input.email.toLowerCase() &&
            current(item).invitation.status === 'ACCEPTED',
        )
      )
        throw new Error('Este e-mail já possui um convite aceito.')
      demoInvitations.forEach((previous) => {
        if (
          previous.invitation.email.toLowerCase() === input.email.toLowerCase() &&
          ['PENDING', 'EXPIRED'].includes(current(previous).invitation.status)
        ) {
          previous.invitation.status = 'REVOKED'
          previous.invitation.allowedActions = []
        }
      })
      const record: DemoInvitationRecord = {
        invitation: {
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          allowedActions: ['RESEND', 'REVOKE'],
        },
        token: `local-${crypto.randomUUID()}`,
      }
      demoInvitations.unshift(record)
      return clone(record.invitation)
    },
    resend: async (id, signal) => {
      signal.throwIfAborted()
      const previous = byId(id)
      if (!previous.invitation.allowedActions.includes('RESEND'))
        throw new Error('O reenvio não é permitido para este convite.')
      previous.invitation.status = 'REVOKED'
      previous.invitation.allowedActions = []
      const next: DemoInvitationRecord = {
        invitation: {
          ...previous.invitation,
          id: crypto.randomUUID(),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          allowedActions: ['RESEND', 'REVOKE'],
        },
        token: `local-${crypto.randomUUID()}`,
      }
      demoInvitations.unshift(next)
      return clone(next.invitation)
    },
    revoke: async (id, signal) => {
      signal.throwIfAborted()
      const record = byId(id)
      if (!record.invitation.allowedActions.includes('REVOKE'))
        throw new Error('A revogação não é permitida para este convite.')
      record.invitation.status = 'REVOKED'
      record.invitation.allowedActions = []
      return clone(record.invitation)
    },
    inspect: async (token, signal) => {
      signal.throwIfAborted()
      const { name, email, status, expiresAt } = byToken(token).invitation
      return { name, email, status, expiresAt }
    },
    accept: async (input, signal) => {
      signal.throwIfAborted()
      const record = byToken(input.token)
      if (record.invitation.status !== 'PENDING')
        throw new Error(
          'Este convite já foi aceito, expirou ou foi revogado. Solicite um novo link quando necessário.',
        )
      record.invitation.status = 'ACCEPTED'
      record.invitation.allowedActions = []
      // Não guarda senha, não cria JWT e não concede permissões na API real.
    },
  }
}
