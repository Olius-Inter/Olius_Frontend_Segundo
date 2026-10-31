import type { AdminGateway } from '../../types/admin-records/admin'
export const adminGateway: AdminGateway = { resources: {} }
export function configureAdminGateway(gateway: AdminGateway) {
  Object.assign(adminGateway, gateway)
}
