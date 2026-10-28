import type { AnalyticsGateway } from '../types/analytics'
export const analyticsGateway: AnalyticsGateway = {}
export function configureAnalyticsGateway(gateway: AnalyticsGateway) {
  Object.assign(analyticsGateway, gateway)
}
