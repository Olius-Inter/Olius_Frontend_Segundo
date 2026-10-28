import type { AdminIdentity, LoginInput } from '../types/auth'
let login: (input: LoginInput) => Promise<AdminIdentity> = async () => {
  throw new Error('E-mail ou senha incorretos.')
}
export function configureLocalDemoLogin(action: typeof login) {
  login = action
}
export async function loginLocalDemo(input: LoginInput): Promise<AdminIdentity> {
  return login(input)
}
