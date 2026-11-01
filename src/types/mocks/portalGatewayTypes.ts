import type { SettingsGateway } from '../settings/settings'
import type { NotificationsGateway } from '../notifications/notifications'
import type { ScheduleGateway } from '../schedule/schedule'
export type PortalGateway = SettingsGateway & NotificationsGateway & ScheduleGateway
