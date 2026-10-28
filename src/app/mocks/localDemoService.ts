import { demoPortal } from './demoPortalStore'
import type { AdminIdentity, LoginInput } from '../../features/auth/types/auth'

// Credenciais públicas e fictícias, exclusivas da demonstração local solicitada.
// Não representam uma conta da Core e não geram JWT ou permissões no backend.
export async function loginLocalDemoMock(input: LoginInput): Promise<AdminIdentity> {
  try {
    if (input.email !== demoPortal.profile.email || input.password !== demoPortal.password) {
      throw new Error('E-mail ou senha incorretos.')
    }
    return {
      id: '00000000-0000-0000-0000-000000000001',
      name: demoPortal.profile.name,
      email: demoPortal.profile.email,
      userType: 'ADMIN',
      status: 'ACTIVE',
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível entrar.')
  }
}
