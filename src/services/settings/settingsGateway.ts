import type { SettingsGateway } from '../../types/settings/settings'
export const portalGateway: SettingsGateway = {}
export function configureSettingsGateway(gateway: SettingsGateway) {
  Object.assign(portalGateway, gateway)
}
