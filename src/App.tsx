import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import DriversPage from './pages/DriversPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import DriverCreate from './pages/DriverCreate'
import DriverEdit from './pages/DriverEdit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="motoristas" element={<DriversPage />} />
          <Route path="motoristas/novo" element={<DriverCreate />} />
          <Route path="motoristas/:driverId/editar" element={<DriverEdit />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
