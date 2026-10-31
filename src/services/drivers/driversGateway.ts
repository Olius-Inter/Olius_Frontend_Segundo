import type { DriversGateway } from '../../types/drivers/gateway'
export const adminGateway: DriversGateway = {}
export function configureDriversGateway(gateway: DriversGateway) {
  Object.assign(adminGateway, gateway)
}
