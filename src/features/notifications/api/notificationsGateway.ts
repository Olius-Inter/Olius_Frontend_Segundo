import type { NotificationsGateway } from '../types/notifications'
export const portalGateway: NotificationsGateway = {}
export function configureNotificationsGateway(gateway: NotificationsGateway) {
  Object.assign(portalGateway, gateway)
}
export let notificationDemoAction: (signal: AbortSignal) => Promise<void> = async () => {
  throw new Error('Este recurso de teste está indisponível.')
}
export function configureNotificationDemo(action: typeof notificationDemoAction) {
  notificationDemoAction = action
}
