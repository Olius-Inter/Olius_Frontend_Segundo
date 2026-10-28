import { localDemoEnabled } from '../../shared/api/coreClient'
import { configureAdminGateway } from '../../features/admin-records/api/adminGateway'
import { configureDriversGateway } from '../../features/drivers/api/driversGateway'
import { configureAnalyticsGateway } from '../../features/reports/api/analyticsGateway'
import { configureSettingsGateway } from '../../features/settings/api/settingsGateway'
import {
  configureNotificationsGateway,
  configureNotificationDemo,
} from '../../features/notifications/api/notificationsGateway'
import { configureScheduleGateway } from '../../features/schedule/api/scheduleGateway'
import {
  configureAdminInvitationGateway,
  configureLocalInvitationPath,
} from '../../features/invitations/api/adminInvitationGateway'
import { configureLocalDemoLogin } from '../../features/auth/api/localDemoService'
import { defaultAdminFilters } from '../../features/admin-records/validation/adminValidation'
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
