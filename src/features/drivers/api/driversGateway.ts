import type { DriversGateway } from '../types/gateway'
export const adminGateway: DriversGateway = {}
export function configureDriversGateway(gateway: DriversGateway) {
  Object.assign(adminGateway, gateway)
}
