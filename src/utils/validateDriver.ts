import type { DriverFormErrors, DriverFormMode, DriverFormValues } from '../types/driver';

export function sanitizeName(value: string): string {
  return value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ');
}

export function documentDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
  return documentDigits(value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function maskCpf(value: string): string {
  const digits = documentDigits(value);
  return digits.length === 11 ? `***.***.***-${digits.slice(-2)}` : 'CPF indisponível';
}

function hasValidCpf(value: string): boolean {
  const digits = documentDigits(value);
  if (!/^[\d.\-\s]+$/.test(value) || digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  for (const length of [9, 10]) {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(digits[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[length])) return false;
  }
  return true;
}

export function sanitizeDriver(values: DriverFormValues): DriverFormValues {
  return { ...values, name: sanitizeName(values.name), cpf: documentDigits(values.cpf), cnh: values.cnh.trim() };
}

export function validateDriver(values: DriverFormValues, mode: DriverFormMode): DriverFormErrors {
  const errors: DriverFormErrors = {};
  const name = sanitizeName(values.name);
  if (!name) errors.name = 'Informe o nome do motorista.';
  else if (name.length < 3 || name.length > 120) errors.name = 'O nome deve ter entre 3 e 120 caracteres.';
  else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]*$/u.test(name)) errors.name = 'Use letras, espaços, apóstrofos, pontos ou hífens no nome.';

  if (mode === 'create') {
    if (!values.cpf.trim()) errors.cpf = 'Informe o CPF.';
    else if (!hasValidCpf(values.cpf)) errors.cpf = 'Informe um CPF válido com 11 dígitos.';
  }

  if (!values.cnh.trim()) errors.cnh = 'Informe o número da CNH.';
  else if (!/^\d{11}$/.test(values.cnh.trim()) || /^(\d)\1+$/.test(values.cnh.trim())) errors.cnh = 'Informe uma CNH com 11 dígitos, sem uma sequência de dígitos iguais.';

  if (values.status !== 'ACTIVE' && values.status !== 'INACTIVE') errors.status = 'Selecione um status válido.';
  return errors;
}
