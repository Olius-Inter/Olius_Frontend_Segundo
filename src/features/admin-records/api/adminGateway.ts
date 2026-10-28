import type { AdminGateway } from '../types/admin'
export const adminGateway: AdminGateway = { resources: {} }
export function configureAdminGateway(gateway: AdminGateway) {
  Object.assign(adminGateway, gateway)
}
