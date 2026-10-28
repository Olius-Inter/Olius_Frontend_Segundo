import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthScope from '../../features/auth/components/AuthScope'
import AdminRoute from '../../features/auth/components/AdminRoute'
import AppLayout from '../layouts/AppLayout'
import PageFeedback from '../../shared/ui/PageFeedback'
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'))
const NotFound = lazy(() => import('../../shared/ui/NotFoundPage'))
export default function App() {
  return (
    <BrowserRouter>
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
          <Route element={<AuthScope />}>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminRoute />}>
              <Route element={<AppLayout />}>
                <Route
                  index
                  element={
                    <PageFeedback
                      kind="empty"
                      title="Portal administrativo"
                      description="Selecione uma área disponível no menu."
                    />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
