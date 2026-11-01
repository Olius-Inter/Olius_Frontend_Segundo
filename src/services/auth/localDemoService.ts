import { sanitizeLoginInput, validateLogin } from '../../utils/auth/loginValidation'
import type { AdminIdentity, LoginInput } from '../../types/auth/auth'
let login: (input: LoginInput) => Promise<AdminIdentity> = async () => {
  throw new Error('E-mail ou senha incorretos.')
}
export function configureLocalDemoLogin(action: typeof login) {
  login = action
}
export async function loginLocalDemo(input: LoginInput): Promise<AdminIdentity> {
  const clean = sanitizeLoginInput(input)
  if (Object.keys(validateLogin(clean)).length)
    throw new Error('Confira o e-mail e a senha informados.')
  return login(clean)
}
