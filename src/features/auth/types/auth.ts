import type { ReactNode } from 'react'

export interface AdminIdentity {
  id: string
  name: string
  email: string
  userType: 'ADMIN'
  status: 'ACTIVE'
}
export interface LoginInput {
  email: string
  password: string
}
export interface ManagedUser {
  id: string
  name: string
  email: string
  userType: 'ADMIN' | 'CITIZENS' | 'ESTABLISHMENT'
  status: 'ACTIVE' | 'INACTIVE'
}
export type AuthState =
  | { phase: 'loading' }
  | { phase: 'anonymous' | 'not-configured' | 'forbidden' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; user: AdminIdentity }
export interface AuthContextValue {
  demo: boolean
  state: AuthState
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  retry: () => void
}
export interface AuthProviderProps {
  children: ReactNode
}
export interface AdminAccountsProps {
  allowInvite?: boolean
  expectedType?: Extract<ManagedUser['userType'], 'ADMIN' | 'ESTABLISHMENT'>
}
