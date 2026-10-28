export type DriverStatus = 'ACTIVE' | 'INACTIVE'
export type DriverFormMode = 'create' | 'edit'

export interface Driver {
  id: string
  name: string
  cpf: string
  cnh: string
  status: DriverStatus
  createdAt?: string
  updatedAt?: string
}

export interface DriverFormValues {
  name: string
  cpf: string
  cnh: string
  status: DriverStatus
}

export type DriverField = keyof DriverFormValues
export type DriverFormErrors = Partial<Record<DriverField, string>>
export type DriverTouched = Partial<Record<DriverField, boolean>>

export interface DriverFormState {
  values: DriverFormValues
  errors: DriverFormErrors
  touched: DriverTouched
  checked: boolean
  valid: boolean
}

export interface DriverCreateInput {
  name: string
  cpf: string
  cnh: string
  status: DriverStatus
}

export interface DriverUpdateInput {
  name: string
  cnh: string
}

export type DriverEditState =
  | { phase: 'unavailable' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'not-found' }
  | { phase: 'ready'; driver: Driver }

export interface UseDriverForEditResult {
  state: DriverEditState
  retry: () => void
}

export type DriverValidationState =
  | { phase: 'editing'; touched: DriverTouched }
  | { phase: 'valid'; touched: DriverTouched }
  | { phase: 'invalid'; touched: DriverTouched; firstError: DriverField }

export type DriverValidationAction =
  | { type: 'change' }
  | { type: 'blur'; field: DriverField }
  | { type: 'valid' }
  | { type: 'invalid'; firstError: DriverField }
