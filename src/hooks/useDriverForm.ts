import { useState } from 'react';
import type { DriverField, DriverFormMode, DriverFormState, DriverFormValues } from '../types/driver';
import { formatCpf, sanitizeDriver, validateDriver } from '../utils/validateDriver';

export function useDriverForm(initialValues: DriverFormValues, mode: DriverFormMode) {
  const [state, setState] = useState<DriverFormState>({
    values: { ...initialValues, cpf: formatCpf(initialValues.cpf) },
    errors: {}, touched: {}, checked: false, valid: false,
  });

  function change(field: DriverField, value: string) {
    if (mode === 'edit' && (field === 'cpf' || field === 'status')) return;
    setState(previous => {
      const values = { ...previous.values, [field]: field === 'cpf' ? formatCpf(value) : value };
      return { ...previous, values, errors: validateDriver(values, mode), checked: false, valid: false };
    });
  }

  function blur(field: DriverField) {
    setState(previous => ({
      ...previous, touched: { ...previous.touched, [field]: true }, errors: validateDriver(previous.values, mode),
    }));
  }

  function check(): DriverField | undefined {
    const errors = validateDriver(state.values, mode);
    const valid = Object.keys(errors).length === 0;
    setState(previous => ({
      ...previous, values: valid ? { ...sanitizeDriver(previous.values), cpf: formatCpf(previous.values.cpf) } : previous.values,
      errors, touched: { name: true, cpf: true, cnh: true, status: true }, checked: true, valid,
    }));
    return (Object.keys(errors) as DriverField[])[0];
  }

  return { state, change, blur, check };
}
