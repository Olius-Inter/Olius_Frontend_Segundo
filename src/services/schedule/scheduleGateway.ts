import type { ScheduleGateway } from '../../types/schedule/schedule'
export const portalGateway: ScheduleGateway = {}
export function configureScheduleGateway(gateway: ScheduleGateway) {
  Object.assign(portalGateway, gateway)
}
