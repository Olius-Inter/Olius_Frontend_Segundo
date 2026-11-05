import { CoreError, coreRequest, acceptCoreAdminInvitation } from '../coreClient'
import type {
  AdminInvitation,
  AdminInvitationGateway,
  AdminInvitationInput,
} from '../../types/invitations/adminInvitation'
import { validAdminInvitation } from '../../utils/invitations/adminInvitationValidation'
import { isUuid } from '../../utils/isUuid'

const path = '/api/v1/admin/invitations'
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Resposta de convite inválida.')
  return value as Record<string, unknown>
}
function invitation(value: unknown): AdminInvitation {
  const data = record(value)
  const states = ['AVAILABLE', 'EXPIRED', 'REVOKED', 'ACCEPTED']
  if (!states.includes(String(data.state))) throw new Error('Situação de convite inválida.')
  const status = data.state === 'AVAILABLE' ? 'PENDING' : data.state
  const normalized = {
    id: data.id,
    name: data.name,
    email: data.email,
    expiresAt: data.expiresAt,
    status,
    allowedActions:
      data.state === 'AVAILABLE'
        ? ['RESEND', 'REVOKE']
        : data.state === 'EXPIRED'
          ? ['RESEND']
          : [],
  }
  if (!validAdminInvitation(normalized)) throw new Error('Resposta de convite inválida.')
  return normalized
}
function itemPath(id: string): string {
  if (!isUuid(id)) throw new Error('Identificador de convite inválido.')
  return `${path}/${id}`
}
async function get(id: string, signal: AbortSignal): Promise<AdminInvitation> {
  return invitation(await (await coreRequest(itemPath(id), { signal })).json())
}
async function issue(input: AdminInvitationInput, signal: AbortSignal): Promise<AdminInvitation> {
  try {
    return invitation(
      await (
        await coreRequest(path, {
          method: 'POST',
          signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: input.name, email: input.email }),
        })
      ).json(),
    )
  } catch (error: unknown) {
    if (error instanceof CoreError && (error.status === 503 || error.status === 0))
      throw new Error(
        'Não foi possível confirmar a entrega do convite. Consulte a lista antes de reenviar. O serviço de e-mail pode estar indisponível.',
      )
    throw error
  }
}
export function createCoreAdminInvitationGateway(): AdminInvitationGateway {
  return {
    list: async (query, signal) => {
      const params = new URLSearchParams({
        page: String(query.page - 1),
        size: String(query.pageSize),
      })
      const data = record(await (await coreRequest(`${path}?${params}`, { signal })).json())
      if (
        !Array.isArray(data.items) ||
        data.page !== query.page - 1 ||
        data.size !== query.pageSize ||
        !Number.isSafeInteger(data.totalElements) ||
        Number(data.totalElements) < 0
      )
        throw new Error('Página de convites inválida.')
      return {
        items: data.items.map(invitation),
        total: Number(data.totalElements),
        totalPages: Math.ceil(Number(data.totalElements) / query.pageSize),
      }
    },
    create: issue,
    resend: async (id, signal) => {
      const current = await get(id, signal)
      if (!current.allowedActions.includes('RESEND'))
        throw new Error('Este convite não pode ser reenviado.')
      return issue({ name: current.name, email: current.email }, signal)
    },
    revoke: async (id, signal) => {
      await coreRequest(`${itemPath(id)}/revocation`, { method: 'POST', signal })
      return get(id, signal)
    },
    accept: acceptCoreAdminInvitation,
  }
}
