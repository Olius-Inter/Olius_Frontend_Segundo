import type { Driver, DriverFormValues } from '../types/driver'
import { adminGateway } from './driversGateway'
import { sanitizeDriver, validateDriver } from '../validation/validateDriver'
import { isUuid } from '../../../shared/lib/isUuid'

export const driverIntegrationAvailable = (): boolean => Boolean(adminGateway.drivers)
export const driverSaveAvailable = (mode: 'create' | 'edit'): boolean =>
  Boolean(mode === 'create' ? adminGateway.drivers?.create : adminGateway.drivers?.update)
function validateRecord(value: Driver): Driver {
  if (
    !value ||
    !isUuid(value.id) ||
    typeof value.name !== 'string' ||
    typeof value.cpf !== 'string' ||
    typeof value.cnh !== 'string' ||
    !['ACTIVE', 'INACTIVE'].includes(value.status)
  )
    throw new Error('O cadastro recebido está em um formato inválido.')
  return value
}
export async function getDriver(id: string, signal: AbortSignal): Promise<Driver | undefined> {
  try {
    if (!isUuid(id)) throw new Error('Identificador do motorista inválido.')
    if (!adminGateway.drivers)
      throw new Error('Consulta de motorista aguardando contrato administrativo da API.')
    const driver = await adminGateway.drivers.get(id, signal)
    return driver ? validateRecord(driver) : undefined
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar o motorista.')
  }
}
// Compatibilidade para componentes anteriores, fora da navegação administrativa.
// Não chamar um endpoint hipotético nem baixar todos os motoristas para filtrar localmente.
export async function listDrivers(signal?: AbortSignal): Promise<Driver[]> {
  try {
    signal?.throwIfAborted()
    throw new Error('Use a listagem administrativa paginada de motoristas.')
  } catch (error: unknown) {
    throw error
  }
}
export async function saveDriver(
  mode: 'create' | 'edit',
  values: DriverFormValues,
  id: string | undefined,
  signal: AbortSignal,
): Promise<Driver> {
  try {
    const clean = sanitizeDriver(values)
    const errors = validateDriver(clean, mode)
    if (Object.keys(errors).length) throw new Error('Revise os campos indicados.')
    if (mode === 'create') {
      if (!adminGateway.drivers?.create) throw new Error('Cadastro aguardando contrato da API.')
      return validateRecord(
        await adminGateway.drivers.create(
          { name: clean.name, cpf: clean.cpf, cnh: clean.cnh, status: clean.status },
          signal,
        ),
      )
    }
    if (!id || !isUuid(id) || !adminGateway.drivers?.update)
      throw new Error('Edição aguardando contrato administrativo da API.')
    return validateRecord(
      await adminGateway.drivers.update(id, { name: clean.name, cnh: clean.cnh }, signal),
    )
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível salvar o motorista.')
  }
}
