import type { AuthState, LoginInput } from './auth'

export type LoginField = keyof LoginInput
export type LoginErrors = Partial<Record<LoginField, string>>
export interface LoginFeedback {
  busy: boolean
  message: string
}
export interface LoginFormResult {
  state: AuthState
  retry: () => void
  values: LoginInput
  errors: LoginErrors
  feedback: LoginFeedback
  target: string
  notice: string | null
  change: (field: LoginField, value: string) => void
  blur: (field: LoginField) => void
  submit: () => Promise<LoginField | null>
}
