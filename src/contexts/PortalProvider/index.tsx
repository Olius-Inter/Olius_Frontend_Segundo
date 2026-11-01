import type { ProviderProps } from '../../types/provider'
import ProfileProvider from '../ProfileContext'
import NotificationProvider from '../NotificationsContext'
export default function PortalProvider({ children }: ProviderProps) {
  return (
    <ProfileProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </ProfileProvider>
  )
}
