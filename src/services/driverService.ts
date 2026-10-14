import type { Driver, DriverStatus } from '../types/driver'

const DRIVERS_ENDPOINT = '/api/v1/drivers'

function isDriver(value: unknown): value is Driver {
  if (typeof value !== 'object' || value === null) return false

  const driver = value as Record<string, unknown>
  const isStatus = (status: unknown): status is DriverStatus =>
    status === 'ACTIVE' || status === 'INACTIVE'

  return (
    typeof driver.id === 'string' &&
    driver.id.trim().length > 0 &&
    typeof driver.name === 'string' &&
    typeof driver.cpf === 'string' &&
    typeof driver.cnh === 'string' &&
    (driver.createdAt === undefined || typeof driver.createdAt === 'string') &&
    (driver.updatedAt === undefined || typeof driver.updatedAt === 'string') &&
    isStatus(driver.status)
  )
}

export async function listDrivers(signal?: AbortSignal): Promise<Driver[]> {
  try {
    signal?.throwIfAborted()
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    if (!baseUrl) {
      throw new Error('Configure VITE_API_BASE_URL para consultar os motoristas.')
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${DRIVERS_ENDPOINT}`, {
      signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`A API de motoristas respondeu com erro ${response.status}.`)
    }

    const payload: unknown = await response.json()
    if (!Array.isArray(payload) || !payload.every(isDriver)) {
      throw new Error('A resposta da API de motoristas tem um formato inesperado.')
    }

    if (new Set(payload.map((driver) => driver.id)).size !== payload.length) {
      throw new Error('A resposta da API contém identificadores de motoristas duplicados.')
    }
    return payload
  } catch (error: unknown) {
    if (signal?.aborted) throw error
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à API de motoristas.', { cause: error })
    }
    if (error instanceof SyntaxError) {
      throw new Error('A API de motoristas retornou um JSON inválido.', { cause: error })
    }
    if (error instanceof Error) throw error
    throw new Error('Não foi possível consultar os motoristas.', { cause: error })
  }
}
