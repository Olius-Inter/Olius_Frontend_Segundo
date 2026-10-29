import type { ReactNode } from 'react'

import type { AdminResult } from '../../../shared/types/result'

export interface PortalProfile {
  id: string
  name: string
  email: string
  telephone: string
  avatarUrl: string | null
}

export interface ProfileInput {
  name: string
  email: string
  telephone: string
  avatar: File | null
  removeAvatar: boolean
}

export interface PasswordInput {
  current: string
  next: string
  confirmation: string
}

export interface PortalPreferences {
  _versao: 1
  theme: 'light' | 'dark'
  contrast: boolean
  reader: boolean
}

export interface PreferencesContextValue {
  preferences: PortalPreferences
  change: (patch: Partial<Omit<PortalPreferences, '_versao'>>) => void
  reset: () => void
  storageAvailable: boolean
}

export interface PortalProviderProps {
  children: ReactNode
}

export interface PortalPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number | null
  annualPrice: number | null
  liters: number | null
  collections: number | null
  features: string[]
  featured: boolean
  active: boolean
}

export interface PlanCardProps {
  plan: PortalPlan
  annual: boolean
  onSelect: (plan: PortalPlan) => void
}

export interface ProfilePanelProps {
  profile: PortalProfile
  onSaved: (message: string) => void
}

export interface SettingsLayoutProps {
  children: ReactNode
  section: string
}

export interface PortalProfileResource {
  state:
    | { phase: 'loading' }
    | { phase: 'error'; message: string }
    | { phase: 'ready'; data: AdminResult<PortalProfile> }
  reload: () => void
}

export interface SettingsGateway {
  profile?: {
    get: (signal: AbortSignal) => Promise<PortalProfile>
    save?: (input: ProfileInput, signal: AbortSignal) => Promise<PortalProfile>
    password?: (input: PasswordInput, signal: AbortSignal) => Promise<void>
  }
  plans?: { list: (signal: AbortSignal) => Promise<PortalPlan[]> }
}
