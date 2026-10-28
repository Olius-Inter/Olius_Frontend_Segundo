import type { PortalNotification } from '../types/notifications'

export function validNotification(item: PortalNotification): boolean {
  return Boolean(
    item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      Number.isFinite(Date.parse(item.date)) &&
      ['REQUESTS', 'AGENDA', 'SYSTEM'].includes(item.category) &&
      typeof item.read === 'boolean' &&
      (item.href === null ||
        /^\/(operacao|motoristas|configuracoes|relatorios)(\/|\?|$)/.test(item.href)),
  )
}
