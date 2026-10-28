import type { AdminResult } from '../../../shared/types/result'
import type { NotificationPage, NotificationQuery } from '../types/notifications'
import { portalGateway, notificationDemoAction } from './notificationsGateway'
import { localDemoEnabled } from '../../../shared/api/coreClient'
import { validNotification } from '../validation/notificationValidation'

export async function getNotifications(
  query: NotificationQuery,
  signal: AbortSignal,
): Promise<AdminResult<NotificationPage>> {
  try {
    signal.throwIfAborted()
    if (
      !['ALL', 'REQUESTS', 'AGENDA', 'SYSTEM'].includes(query.category) ||
      !Number.isInteger(query.page) ||
      query.page < 1 ||
      query.pageSize !== 10
    )
      throw new Error('Filtro de notificações inválido.')
    if (!portalGateway.notifications) return unavailable
    const data = await portalGateway.notifications.list(query, signal)
    if (
      !data ||
      !Array.isArray(data.items) ||
      !data.items.every(validNotification) ||
      new Set(data.items.map((n) => n.id)).size !== data.items.length ||
      !Number.isSafeInteger(data.total) ||
      data.total < 0 ||
      !Number.isSafeInteger(data.unreadTotal) ||
      data.unreadTotal < 0 ||
      data.totalPages !== Math.ceil(data.total / query.pageSize) ||
      data.items.length > query.pageSize ||
      !data.items.every(
        (n) =>
          (query.category === 'ALL' || n.category === query.category) &&
          (!query.unreadOnly || !n.read),
      )
    )
      throw new Error('As notificações recebidas são inválidas.')
    return { kind: 'ready', data }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar as notificações.')
  }
}

export async function updateNotifications(
  action: 'read' | 'clear',
  id: string | 'ALL',
  signal: AbortSignal,
): Promise<void> {
  try {
    if (action === 'read' && portalGateway.notifications?.read)
      await portalGateway.notifications.read(id, signal)
    else if (action === 'clear' && portalGateway.notifications?.clearRead)
      await portalGateway.notifications.clearRead(signal)
    else throw new Error('Esta ação aguarda integração autorizada.')
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível atualizar os avisos.')
  }
}

export async function simulateNotification(signal: AbortSignal): Promise<void> {
  try {
    signal.throwIfAborted()
    if (!localDemoEnabled) throw new Error('Este recurso de teste está indisponível.')
    await notificationDemoAction(signal)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível gerar o aviso.')
  }
}
const unavailable = {
  kind: 'unavailable' as const,
  message:
    'A integração desta funcionalidade aguarda um contrato de API. Não há dados reais disponíveis.',
}
