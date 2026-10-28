import type { SettingsGateway } from '../../features/settings/types/settings'
import type { NotificationsGateway } from '../../features/notifications/types/notifications'
import type { ScheduleGateway } from '../../features/schedule/types/schedule'
export type PortalGateway = SettingsGateway & NotificationsGateway & ScheduleGateway
