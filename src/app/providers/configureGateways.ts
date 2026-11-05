import { localDemoEnabled, coreConfigured } from '../../services/coreClient'
import { createCoreAdminInvitationGateway } from '../../services/invitations/coreAdminInvitationGateway'
import {
  createCoreDriverResource,
  createCoreDriversGateway,
} from '../../services/drivers/coreDriversGateway'
import { createCoreRequestsResource } from '../../services/admin-records/coreRequestsResource'
import { createCoreCollectionsResource } from '../../services/admin-records/coreCollectionsResource'
import { createCoreScheduleGateway } from '../../services/schedule/coreScheduleGateway'
import { createCoreSettingsGateway } from '../../services/settings/coreSettingsGateway'
import {
  coreDashboard,
  createCoreAnalyticsGateway,
} from '../../services/reports/coreOperationalReports'
import { configureAdminGateway } from '../../services/admin-records/adminGateway'
import { configureDriversGateway } from '../../services/drivers/driversGateway'
import { configureAnalyticsGateway } from '../../services/reports/analyticsGateway'
import { configureSettingsGateway } from '../../services/settings/settingsGateway'
import {
  configureNotificationsGateway,
  configureNotificationDemo,
} from '../../services/notifications/notificationsGateway'
import { configureScheduleGateway } from '../../services/schedule/scheduleGateway'
import {
  configureAdminInvitationGateway,
  configureLocalInvitationPath,
} from '../../services/invitations/adminInvitationGateway'
import { configureLocalDemoLogin } from '../../services/auth/localDemoService'
import { defaultAdminFilters } from '../../utils/admin-records/adminValidation'
if (localDemoEnabled) {
  const [
    { createMockAdminGateway },
    { createMockPortalGateway },
    { createMockAdminInvitationGateway },
    { demoInvitations },
    { addDemoNotification },
    { loginLocalDemoMock },
  ] = await Promise.all([
    import('../mocks/mockAdminGateway'),
    import('../mocks/mockPortalGateway'),
    import('../mocks/mockAdminInvitationGateway'),
    import('../mocks/adminInvitationDemo'),
    import('../mocks/demoPortalStore'),
    import('../mocks/localDemoService'),
  ])
  const admin = createMockAdminGateway()
  const portal = createMockPortalGateway()
  configureAdminGateway(admin)
  configureDriversGateway(admin)
  configureSettingsGateway(portal)
  configureNotificationsGateway(portal)
  configureScheduleGateway(portal)
  configureAdminInvitationGateway(createMockAdminInvitationGateway())
  configureLocalDemoLogin(loginLocalDemoMock)
  configureNotificationDemo(async (signal) => {
    signal.throwIfAborted()
    addDemoNotification(
      'Novo aviso de teste',
      'Aviso gerado agora para testar leitura, contagem e filtros.',
      '/operacao/agenda',
    )
  })
  configureLocalInvitationPath((id) => {
    const record = demoInvitations.find((item) => item.invitation.id === id)
    return record?.invitation.status === 'PENDING'
      ? '/convites/aceitar#token=' + encodeURIComponent(record.token)
      : null
  })
  configureAnalyticsGateway({
    reports: async (query, signal) => {
      signal.throwIfAborted()
      if (!admin.dashboard) throw new Error('Fonte analítica indisponível.')
      const data = await admin.dashboard({ ...defaultAdminFilters(), ...query }, signal)
      return {
        period: query,
        generatedAt: new Date().toISOString(),
        complete: true,
        charts: data.charts,
      }
    },
  })
}

if (!localDemoEnabled && coreConfigured) {
  configureAdminInvitationGateway(createCoreAdminInvitationGateway())
  configureAdminGateway({
    resources: {
      drivers: createCoreDriverResource(),
      requests: createCoreRequestsResource(),
      collections: createCoreCollectionsResource(),
    },
    dashboard: coreDashboard,
  })
  configureDriversGateway(createCoreDriversGateway())
  configureScheduleGateway(createCoreScheduleGateway())
  configureSettingsGateway(createCoreSettingsGateway())
  configureAnalyticsGateway(createCoreAnalyticsGateway())
}
