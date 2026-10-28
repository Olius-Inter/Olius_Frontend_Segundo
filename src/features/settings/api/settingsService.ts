import type { AdminResult } from '../../../shared/types/result'
import type { PasswordInput, PortalPlan, PortalProfile, ProfileInput } from '../types/settings'
import { portalGateway } from './settingsGateway'
import { coreConfigured, coreRequest } from '../../../shared/api/coreClient'
import { validProfile, validatePassword, validateProfile } from '../validation/settingsValidation'

const unavailable = {
  kind: 'unavailable' as const,
  message:
    'A integração desta funcionalidade aguarda um contrato de API. Não há dados reais disponíveis.',
}

export async function getPortalProfile(signal: AbortSignal): Promise<AdminResult<PortalProfile>> {
  try {
    signal.throwIfAborted()
    if (portalGateway.profile) {
      const profile = await portalGateway.profile.get(signal)
      if (!validProfile(profile)) throw new Error('Perfil recebido em formato inválido.')
      return { kind: 'ready', data: profile }
    }
    if (!coreConfigured) return unavailable
    const value: unknown = await (await coreRequest('/api/v1/users/me', { signal })).json()
    if (
      !value ||
      typeof value !== 'object' ||
      !('id' in value) ||
      typeof value.id !== 'string' ||
      !('name' in value) ||
      typeof value.name !== 'string' ||
      !('email' in value) ||
      typeof value.email !== 'string'
    )
      throw new Error('Não foi possível ler seu perfil.')
    const telephone =
      'telephones' in value &&
      Array.isArray(value.telephones) &&
      typeof value.telephones[0] === 'string'
        ? value.telephones[0]
        : ''
    return {
      kind: 'ready',
      data: { id: value.id, name: value.name, email: value.email, telephone, avatarUrl: null },
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar seu perfil.')
  }
}

export async function savePortalProfile(
  input: ProfileInput,
  signal: AbortSignal,
): Promise<PortalProfile> {
  try {
    const error = validateProfile(input)
    if (error) throw new Error(error)
    if (!portalGateway.profile?.save)
      throw new Error('A alteração de perfil depende do endpoint autorizado da API.')
    const data = await portalGateway.profile.save(input, signal)
    if (!validProfile(data)) throw new Error('A confirmação do perfil é inválida.')
    return data
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível salvar o perfil.')
  }
}

export async function changePortalPassword(
  input: PasswordInput,
  signal: AbortSignal,
): Promise<void> {
  try {
    const error = validatePassword(input)
    if (error) throw new Error(error)
    if (!portalGateway.profile?.password)
      throw new Error('A troca de senha aguarda o contrato de segurança da API.')
    await portalGateway.profile.password(input, signal)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível alterar a senha.')
  }
}

export async function getPortalPlans(signal: AbortSignal): Promise<AdminResult<PortalPlan[]>> {
  try {
    signal.throwIfAborted()
    if (!portalGateway.plans) return unavailable
    const plans = await portalGateway.plans.list(signal)
    if (
      !Array.isArray(plans) ||
      plans.some(
        (p) =>
          !p ||
          typeof p.id !== 'string' ||
          typeof p.name !== 'string' ||
          typeof p.description !== 'string' ||
          typeof p.active !== 'boolean' ||
          typeof p.featured !== 'boolean' ||
          !Array.isArray(p.features) ||
          !p.features.every((f) => typeof f === 'string') ||
          [p.monthlyPrice, p.annualPrice, p.liters, p.collections].some(
            (n) => n !== null && (!Number.isFinite(n) || n < 0),
          ),
      ) ||
      new Set(plans.map((p) => p.id)).size !== plans.length
    )
      throw new Error('Catálogo de planos inválido.')
    return { kind: 'ready', data: plans.filter((p) => p.active) }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar os planos.')
  }
}
