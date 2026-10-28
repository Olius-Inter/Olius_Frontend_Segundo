import type { ProviderProps } from '../../../shared/types/provider'
import ProfileProvider from '../../../features/settings/providers'
export default function PortalProvider({ children }: ProviderProps) {
  return (
    <>
      <ProfileProvider>{children}</ProfileProvider>
    </>
  )
}
