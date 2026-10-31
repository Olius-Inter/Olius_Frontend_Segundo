import type { AnalyticsGateway } from '../../types/reports/analytics'
export const analyticsGateway: AnalyticsGateway = {}
export function configureAnalyticsGateway(gateway: AnalyticsGateway) {
  Object.assign(analyticsGateway, gateway)
}
