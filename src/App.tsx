import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'

const DriversPage = lazy(() => import('./pages/DriversPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const DriverCreate = lazy(() => import('./pages/DriverCreate'))
const DriverEdit = lazy(() => import('./pages/DriverEdit'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const RankingPage = lazy(() => import('./pages/RankingPage'))
const CollectionMapPage = lazy(() => import('./pages/CollectionMapPage'))
const CollectorEnrollmentPage = lazy(() => import('./pages/CollectorEnrollmentPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="motoristas" element={<DriversPage />} />
          <Route path="motoristas/novo" element={<DriverCreate />} />
          <Route path="motoristas/:driverId/editar" element={<DriverEdit />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="historico" element={<HistoryPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="mapa" element={<CollectionMapPage />} />
          <Route path="mapa/virar-coletor" element={<CollectorEnrollmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
