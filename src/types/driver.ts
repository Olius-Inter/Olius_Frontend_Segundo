export type DriverStatus = 'ACTIVE' | 'INACTIVE';
export type DriverFormMode = 'create' | 'edit';

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  cnh: string;
  status: DriverStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverFormValues {
  name: string;
  cpf: string;
  cnh: string;
  status: DriverStatus;
}

export type DriverField = keyof DriverFormValues;
export type DriverFormErrors = Partial<Record<DriverField, string>>;
export type DriverTouched = Partial<Record<DriverField, boolean>>;

export interface DriverFormState {
  values: DriverFormValues;
  errors: DriverFormErrors;
  touched: DriverTouched;
  checked: boolean;
  valid: boolean;
}

export interface DriverCreateInput {
  name: string;
  cpf: string;
  cnh: string;
  status: DriverStatus;
}

export interface DriverUpdateInput {
  name: string;
  cnh: string;
}

export type DriverEditState =
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'not-found' }
  | { phase: 'ready'; driver: Driver };
