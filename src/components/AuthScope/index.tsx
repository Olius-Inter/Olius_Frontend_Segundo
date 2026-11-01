import { Outlet } from 'react-router-dom'
import AuthProvider from '../../contexts/AuthContext'

export default function AuthScope() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
