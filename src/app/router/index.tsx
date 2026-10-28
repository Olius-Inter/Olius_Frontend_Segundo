import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthScope from '../../features/auth/components/AuthScope'
import PreferencesProvider from '../../features/settings/providers/PreferencesContext'
import AdminRoute from '../../features/auth/components/AdminRoute'
import AppLayout from '../layouts/AppLayout'
import PageFeedback from '../../shared/ui/PageFeedback'

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'))
const AcceptInvitation = lazy(
  () => import('../../features/invitations/pages/AcceptAdminInvitationPage'),
)
const Dashboard = lazy(() => import('../../features/dashboard/pages/AdminDashboardPage'))
const Area = lazy(() => import('./pages/AdminAreaPage'))
const Detail = lazy(() => import('../../features/admin-records/pages/AdminDetailPage'))
const DriverCreate = lazy(() => import('../../features/drivers/pages/DriverCreate'))
const DriverEdit = lazy(() => import('../../features/drivers/pages/DriverEdit'))
const Motorista = lazy(() => import('../../features/drivers/pages/MotoristaPage'))
const Agenda = lazy(() => import('../../features/schedule/pages/AgendaPage'))
const Reports = lazy(() => import('../../features/reports/pages/AdminReportsPage'))
const Notifications = lazy(() => import('../../features/notifications/pages/NotificationsPage'))
const Settings = lazy(() => import('../../features/settings/pages/SettingsPage'))
const NotFound = lazy(() => import('../../shared/ui/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <Suspense
          fallback={
            <PageFeedback
              kind="loading"
              title="Carregando portal"
              description="Aguarde um instante."
            />
          }
        >
          <Routes>
            <Route path="/convites/aceitar" element={<AcceptInvitation />} />
            <Route element={<AuthScope />}>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AdminRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="motoristas" element={<Motorista />} />
                  <Route path="motoristas/novo" element={<DriverCreate />} />
                  <Route path="motoristas/:driverId/editar" element={<DriverEdit />} />
                  <Route path="motoristas/:id" element={<Detail />} />
                  <Route path="operacao/agenda" element={<Agenda />} />
                  <Route path="relatorios" element={<Reports />} />
                  <Route path="notificacoes" element={<Notifications />} />
                  <Route path="configuracoes/:section?" element={<Settings />} />
                  <Route
                    path="cadastros/motoristas"
                    element={<Navigate to="/motoristas" replace />}
                  />
                  <Route path="cadastros/motoristas/novo" element={<DriverCreate />} />
                  <Route path="cadastros/motoristas/:driverId/editar" element={<DriverEdit />} />
                  <Route path="cadastros/motoristas/:id" element={<Detail />} />
                  <Route
                    path="resultados/relatorios"
                    element={<Navigate to="/relatorios" replace />}
                  />
                  <Route
                    path="comercial/planos"
                    element={<Navigate to="/configuracoes/planos" replace />}
                  />
                  <Route path="historico" element={<Navigate to="/operacao/historico" replace />} />
                  <Route path=":area" element={<Area />} />
                  <Route path=":area/:tab" element={<Area />} />
                  <Route path=":area/:tab/:id" element={<Detail />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </PreferencesProvider>
    </BrowserRouter>
  )
}
