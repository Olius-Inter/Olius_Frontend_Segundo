import type { ReactNode } from 'react'

export interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  help?: string
  error?: string
  children: ReactNode
}

export interface FormFeedbackProps {
  checked: boolean
  valid: boolean
}
