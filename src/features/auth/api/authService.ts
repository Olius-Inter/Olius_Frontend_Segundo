import type { AdminIdentity, LoginInput } from '../types/auth'
import {
  coreLogin,
  coreLogout,
  coreRequest,
  refreshAccess,
  CoreError,
  clearAccess,
} from '../../../shared/api/coreClient'
import { isActiveAdmin, readManagedUser } from '../validation/validateAdminIdentity'

export async function currentAdmin(): Promise<AdminIdentity> {
  try {
    const user = readManagedUser(await (await coreRequest('/api/v1/users/me')).json())
    if (!isActiveAdmin(user)) {
      clearAccess()
      throw new CoreError('Acesso exclusivo para contas ADMIN ativas.', 403)
    }
    return { ...user, userType: 'ADMIN', status: 'ACTIVE' }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível validar seu acesso.')
  }
}
export async function loginAdmin(input: LoginInput): Promise<AdminIdentity> {
  try {
    await coreLogin(input)
    return await currentAdmin()
  } catch (error: unknown) {
    clearAccess()
    throw error
  }
}
export async function restoreAdmin(): Promise<AdminIdentity> {
  try {
    await refreshAccess()
    return await currentAdmin()
  } catch (error: unknown) {
    clearAccess()
    throw error
  }
}
export const logoutAdmin = coreLogout
