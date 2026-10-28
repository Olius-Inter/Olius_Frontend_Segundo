import { Outlet } from 'react-router-dom'
import AuthProvider from '../../providers/AuthContext'

export default function AuthScope() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
