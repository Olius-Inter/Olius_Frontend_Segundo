import type { Driver, DriverStatus } from '../types/driver'

const DRIVERS_ENDPOINT = '/api/v1/drivers'

function isDriver(value: unknown): value is Driver {
  if (typeof value !== 'object' || value === null) return false

  const driver = value as Record<string, unknown>
  const isStatus = (status: unknown): status is DriverStatus =>
    status === 'ACTIVE' || status === 'INACTIVE'

  return (
    typeof driver.id === 'string' &&
    typeof driver.name === 'string' &&
    typeof driver.cpf === 'string' &&
    typeof driver.cnh === 'string' &&
    isStatus(driver.status)
  )
}

export async function listDrivers(): Promise<Driver[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error('Configure VITE_API_BASE_URL para consultar os motoristas.')
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, '')}${DRIVERS_ENDPOINT}`,
    { headers: { Accept: 'application/json' } },
  )

  if (!response.ok) {
    throw new Error(`A API de motoristas respondeu com erro ${response.status}.`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !payload.every(isDriver)) {
    throw new Error('A resposta da API de motoristas tem um formato inesperado.')
  }

  return payload
}
