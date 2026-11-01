import type { LoginInput } from '../../types/auth/auth'
import type { LoginErrors } from '../../types/auth/login'

export function sanitizeLoginInput(input: LoginInput): LoginInput {
  return { email: input.email.trim(), password: input.password }
}

export function validateLogin(input: LoginInput): LoginErrors {
  const errors: LoginErrors = {}
  if (!input.email) errors.email = 'Informe seu e-mail.'
  else if (input.email.length > 255) errors.email = 'O e-mail deve ter até 255 caracteres.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    errors.email = 'Informe um e-mail válido.'
  if (!input.password) errors.password = 'Informe sua senha.'
  else if (input.password.length > 256) errors.password = 'A senha deve ter até 256 caracteres.'
  return errors
}

export function loginReturnPath(value: unknown): string {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/login') &&
    !/[\\\u0000-\u001f\u007f]/.test(value)
    ? value
    : '/'
}
