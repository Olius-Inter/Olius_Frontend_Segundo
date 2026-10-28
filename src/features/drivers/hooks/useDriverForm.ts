import { useReducer, useState } from 'react'
import type {
  DriverField,
  DriverFormMode,
  DriverFormState,
  DriverFormValues,
} from '../types/driver'
import { driverValidationReducer } from '../model/driverValidationReducer'
import { formatCpf, sanitizeDriver, validateDriver } from '../validation/validateDriver'

export function useDriverForm(initialValues: DriverFormValues, mode: DriverFormMode) {
  // Campos relacionados permanecem agrupados em um único objeto useState.
  const [values, setValues] = useState<DriverFormValues>({
    ...initialValues,
    cpf: formatCpf(initialValues.cpf),
  })
  // A union impede que uma alteração mantenha o formulário marcado como validado.
  const [validation, dispatch] = useReducer(driverValidationReducer, {
    phase: 'editing',
    touched: {},
  })
  const errors = validateDriver(values, mode)

  function change(field: DriverField, value: string) {
    if (mode === 'edit' && (field === 'cpf' || field === 'status')) return
    setValues((previous) => ({ ...previous, [field]: field === 'cpf' ? formatCpf(value) : value }))
    dispatch({ type: 'change' })
  }

  function blur(field: DriverField) {
    dispatch({ type: 'blur', field })
  }

  function check(): DriverField | undefined {
    const firstError = (Object.keys(errors) as DriverField[])[0]
    if (firstError) dispatch({ type: 'invalid', firstError })
    else {
      setValues((previous) => ({ ...sanitizeDriver(previous), cpf: formatCpf(previous.cpf) }))
      dispatch({ type: 'valid' })
    }
    return firstError
  }

  const state: DriverFormState = {
    values,
    errors,
    touched: validation.touched,
    checked: validation.phase !== 'editing',
    valid: validation.phase === 'valid',
  }
  return { state, change, blur, check }
}
