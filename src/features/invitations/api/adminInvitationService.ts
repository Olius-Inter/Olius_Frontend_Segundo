import type { AdminResult } from '../../../shared/types/result'
import type {
  AdminInvitation,
  AdminInvitationInput,
  InvitationAcceptanceInput,
  InvitationAction,
  InvitationPage,
  InvitationPreview,
  InvitationQuery,
} from '../types/adminInvitation'
import { adminInvitationGateway, localInvitationPath } from './adminInvitationGateway'
import { localDemoEnabled } from '../../../shared/api/coreClient'

import { isUuid } from '../../../shared/lib/isUuid'
import { validatePasswordStrength } from '../../auth'
import {
  validAdminInvitation,
  validInvitationPage,
  validInvitationPreview,
  validInvitationToken,
  validateInvitationInput,
} from '../validation/adminInvitationValidation'

const unavailable = {
  kind: 'unavailable' as const,
  message: 'O fluxo de convites aguarda integração com o serviço de administração.',
}
const safeInvitation = (data: AdminInvitation): AdminInvitation => ({
  id: data.id,
  name: data.name,
  email: data.email,
  status: data.status,
  expiresAt: data.expiresAt,
  allowedActions: [...data.allowedActions],
})
export async function listAdminInvitations(
  query: InvitationQuery,
  signal: AbortSignal,
): Promise<AdminResult<InvitationPage>> {
  try {
    signal.throwIfAborted()
    if (!Number.isSafeInteger(query.page) || query.page < 1 || query.pageSize !== 10)
      throw new Error('Página inválida.')
    if (!adminInvitationGateway.list) return unavailable
    const data = await adminInvitationGateway.list(query, signal)
    if (!validInvitationPage(data, query))
      throw new Error('A lista de convites recebida é inválida.')
    return {
      kind: 'ready',
      data: {
        items: data.items.map(safeInvitation),
        total: data.total,
        totalPages: data.totalPages,
      },
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar os convites.')
  }
}
export async function createAdminInvitation(
  input: AdminInvitationInput,
  signal: AbortSignal,
): Promise<AdminInvitation> {
  try {
    signal.throwIfAborted()
    const error = validateInvitationInput(input)
    if (error) throw new Error(error)
    if (!adminInvitationGateway.create) throw new Error(unavailable.message)
    const data = await adminInvitationGateway.create(
      { name: input.name.trim().normalize('NFC'), email: input.email.trim().toLowerCase() },
      signal,
    )
    if (!validAdminInvitation(data))
      throw new Error('A confirmação do convite é inválida. Atualize a lista antes de reenviar.')
    return safeInvitation(data)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível enviar o convite.')
  }
}
export async function changeAdminInvitation(
  invitation: AdminInvitation,
  action: InvitationAction,
  signal: AbortSignal,
): Promise<void> {
  try {
    signal.throwIfAborted()
    if (!isUuid(invitation.id) || !invitation.allowedActions.includes(action))
      throw new Error('Esta ação não é permitida para o convite selecionado.')
    const operation =
      action === 'RESEND' ? adminInvitationGateway.resend : adminInvitationGateway.revoke
    if (!operation) throw new Error(unavailable.message)
    const data = await operation(invitation.id, signal)
    if (
      !validAdminInvitation(data) ||
      (action === 'REVOKE'
        ? data.id !== invitation.id || data.status !== 'REVOKED'
        : data.id === invitation.id ||
          data.status !== 'PENDING' ||
          data.email.toLowerCase() !== invitation.email.toLowerCase())
    )
      throw new Error(
        'Atualize a lista para conferir a situação do convite antes de repetir a ação.',
      )
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível atualizar o convite.')
  }
}
export async function inspectAdminInvitation(
  token: string,
  signal: AbortSignal,
): Promise<AdminResult<InvitationPreview>> {
  try {
    signal.throwIfAborted()
    if (!validInvitationToken(token)) throw new Error('O link não contém um convite válido.')
    if (!adminInvitationGateway.inspect) return unavailable
    const data = await adminInvitationGateway.inspect(token, signal)
    if (!validInvitationPreview(data))
      throw new Error('Não foi possível validar os dados do convite.')
    return {
      kind: 'ready',
      data: { name: data.name, email: data.email, status: data.status, expiresAt: data.expiresAt },
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível verificar o convite.')
  }
}
export async function acceptAdminInvitation(
  input: InvitationAcceptanceInput,
  signal: AbortSignal,
): Promise<void> {
  try {
    signal.throwIfAborted()
    if (!validInvitationToken(input.token)) throw new Error('O link do convite é inválido.')
    const error = validatePasswordStrength(input.password)
    if (error) throw new Error(error)
    if (!adminInvitationGateway.accept) throw new Error(unavailable.message)
    // Whitelist explícita: confirmação, nome e e-mail nunca entram no payload de aceite.
    await adminInvitationGateway.accept({ token: input.token, password: input.password }, signal)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível aceitar o convite.')
  }
}
// Somente fixtures locais oferecem link de navegação para conferir o aceite sem e-mail.
export function getLocalInvitationPath(id: string): string | null {
  if (!localDemoEnabled) return null
  return localInvitationPath(id)
}
