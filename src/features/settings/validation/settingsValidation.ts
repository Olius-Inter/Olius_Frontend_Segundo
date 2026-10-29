import type { PasswordInput, PortalProfile, ProfileInput } from '../types/settings'
import { validateAdminRegistration } from '../../auth'

export function validateProfile(input: ProfileInput): string | null {
  if (!input.name.trim() || input.name.trim().length > 150)
    return 'Informe seu nome, com até 150 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 255)
    return 'Informe um e-mail válido.'
  if (input.telephone && !/^\+?[\d\s()-]{10,22}$/.test(input.telephone))
    return 'Informe um telefone válido, com DDD.'
  if (
    input.avatar &&
    (!['image/png', 'image/jpeg', 'image/webp'].includes(input.avatar.type) ||
      input.avatar.size > 2 * 1024 * 1024)
  )
    return 'Use uma imagem PNG, JPEG ou WebP de até 2 MB.'
  return null
}

export function validatePassword(input: PasswordInput): string | null {
  if (!input.current) return 'Informe a senha atual.'
  const error = validateAdminRegistration({
    name: 'Perfil',
    email: 'perfil@example.test',
    password: input.next,
  })
  if (error) return error
  if (input.next !== input.confirmation) return 'A confirmação deve ser igual à nova senha.'
  if (input.current === input.next) return 'Escolha uma senha diferente da atual.'
  return null
}

export function validProfile(value: PortalProfile): boolean {
  return Boolean(
    value &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      typeof value.email === 'string' &&
      typeof value.telephone === 'string' &&
      (value.avatarUrl === null ||
        /^(https?:\/\/|data:image\/(png|jpeg|webp);base64,|\/demo\/)/.test(value.avatarUrl)),
  )
}
