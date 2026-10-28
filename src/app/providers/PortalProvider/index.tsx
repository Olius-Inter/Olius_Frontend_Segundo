import type { ProviderProps } from '../../../shared/types/provider'
import ProfileProvider from '../../../features/settings/providers'
import NotificationProvider from '../../../features/notifications/providers'
export default function PortalProvider({ children }: ProviderProps) {
  return (
    <ProfileProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </ProfileProvider>
  )
}
