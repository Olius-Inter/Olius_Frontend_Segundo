import { isUuid } from '../../../shared/lib/isUuid.ts'
import type { AdminIdentity, ManagedUser } from '../types/auth'

export function isActiveAdmin(user: ManagedUser): user is AdminIdentity {
  return user.userType === 'ADMIN' && user.status === 'ACTIVE'
}

export function readManagedUser(value: unknown): ManagedUser {
  if (typeof value !== 'object' || value === null)
    throw new Error('Perfil recebido em formato inválido.')
  const data = value as Record<string, unknown>
  if (
    typeof data.id !== 'string' ||
    !isUuid(data.id) ||
    typeof data.name !== 'string' ||
    !data.name ||
    typeof data.email !== 'string' ||
    !['ADMIN', 'CITIZENS', 'ESTABLISHMENT'].includes(String(data.userType)) ||
    !['ACTIVE', 'INACTIVE'].includes(String(data.status))
  )
    throw new Error('Perfil recebido em formato inválido.')
  // Selecionar apenas o necessário. Profile da Core também contém QR e documentos privados.
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    userType: data.userType as ManagedUser['userType'],
    status: data.status as ManagedUser['status'],
  }
}

export function validateAdminRegistration(input: {
  name: string
  email: string
  password: string
}): string | null {
  if (!input.name.trim() || input.name.trim().length > 150)
    return 'Informe o nome, com até 150 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 255)
    return 'Informe um e-mail válido.'
  return validatePasswordStrength(input.password)
}

export function validatePasswordStrength(password: string): string | null {
  if (
    password.length < 10 ||
    password.length > 128 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^\p{L}\p{N}\s]/u.test(password)
  )
    return 'A senha precisa ter de 10 a 128 caracteres, uma letra maiúscula, um número e um símbolo.'
  return null
}
