import type { Driver } from '../../types/drivers/driver'
import type { DriversGateway } from '../../types/drivers/gateway'
import type {
  AdminDetail,
  AdminFilters,
  AdminResourceAdapter,
} from '../../types/admin-records/admin'
import { CoreError } from '../coreClient'
import {
  date,
  get,
  integer,
  noSearch,
  number,
  object,
  page,
  period,
  send,
  state,
  string,
  uuid,
} from '../core/coreData'

const path = '/api/v1/admin/drivers'
function driver(value: unknown): Driver {
  const data = object(value)
  return {
    id: uuid(data.id),
    name: string(data.name),
    cpf: string(data.cpf),
    cnh: string(data.cnh),
    status: state(data.status, ['ACTIVE', 'INACTIVE']),
    createdAt: date(data.registrationDate),
    updatedAt: date(data.updatedAt),
  }
}
async function getDriver(id: string, signal: AbortSignal): Promise<Driver> {
  const data = driver(await get(`${path}/${uuid(id)}`, signal))
  if (data.id !== id) throw new Error('A API retornou outro motorista.')
  return data
}
async function metrics(id: string, filters: AdminFilters, signal: AbortSignal) {
  const data = object(
    await get(`${path}/${uuid(id)}/metrics?${period(filters.from, filters.to)}`, signal),
  )
  return {
    visits: integer(data.visits),
    liters: number(data.collectedVolumeLiters),
    establishments: integer(data.establishmentsVisited),
    successful: integer(data.successfulVisits),
    unsuccessful: integer(data.unsuccessfulVisits),
    last: data.lastCollectionDate === null ? null : date(data.lastCollectionDate),
  }
}
export function createCoreDriversGateway(): DriversGateway {
  return {
    drivers: {
      get: async (id, signal) => {
        try {
          return await getDriver(id, signal)
        } catch (error: unknown) {
          if (error instanceof CoreError && error.status === 404) return undefined
          throw error
        }
      },
      create: async (input, signal) => {
        if (input.status !== 'ACTIVE')
          throw new Error(
            'A API cadastra motoristas como ativos. Cadastre como Ativo e depois use a ação Inativar no detalhe.',
          )
        return driver(
          await (
            await send(path, 'POST', { name: input.name, cpf: input.cpf, cnh: input.cnh }, signal)
          ).json(),
        )
      },
      update: async (id, input, signal) => {
        const data = driver(
          await (
            await send(`${path}/${uuid(id)}`, 'PATCH', { name: input.name, cnh: input.cnh }, signal)
          ).json(),
        )
        if (data.id !== id) throw new Error('A API retornou outro motorista.')
        return data
      },
    },
  }
}
export function createCoreDriverResource(): AdminResourceAdapter {
  return {
    list: async (filters, signal) => {
      noSearch(filters.search)
      const params = new URLSearchParams()
      if (filters.status) params.set('status', state(filters.status, ['ACTIVE', 'INACTIVE']))
      const data = await page(path, params, filters.page - 1, filters.pageSize, signal)
      const items = await Promise.all(
        data.items.map(async (value) => {
          const row = driver(value)
          const counts = await metrics(row.id, filters, signal)
          return {
            id: row.id,
            title: row.name,
            cells: {
              name: row.name,
              status: row.status,
              collections: counts.visits,
              collectedLiters: counts.liters,
              establishments: counts.establishments,
            },
          }
        }),
      )
      return {
        items,
        total: data.total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(data.total / filters.pageSize),
      }
    },
    detail: async (id, filters, signal): Promise<AdminDetail> => {
      const row = await getDriver(id, signal)
      const counts = await metrics(id, filters, signal)
      return {
        id,
        title: row.name,
        revision: null,
        actions: [row.status === 'ACTIVE' ? 'inactivate' : 'activate'],
        history: [],
        sections: [
          {
            title: 'Cadastro',
            fields: [
              { label: 'Nome', value: row.name },
              { label: 'CPF', value: row.cpf },
              { label: 'CNH', value: row.cnh },
              { label: 'Situação', value: row.status, format: 'status' },
              { label: 'Cadastro', value: row.createdAt ?? null, format: 'date' },
            ],
          },
          {
            title: 'Indicadores no período selecionado',
            fields: [
              { label: 'Visitas', value: counts.visits },
              { label: 'Litros recolhidos', value: counts.liters, format: 'liters' },
              { label: 'Estabelecimentos atendidos', value: counts.establishments },
              { label: 'Bem-sucedidas', value: counts.successful },
              { label: 'Malsucedidas', value: counts.unsuccessful },
              { label: 'Última coleta', value: counts.last, format: 'date' },
            ],
          },
        ],
      }
    },
    act: async (id, input, signal) => {
      if (!['activate', 'inactivate'].includes(input.action))
        throw new Error('Ação inválida para motorista.')
      const expected = input.action === 'activate' ? 'ACTIVE' : 'INACTIVE'
      const result = driver(
        await (
          await send(`${path}/${uuid(id)}/status`, 'PATCH', { status: expected }, signal)
        ).json(),
      )
      if (result.id !== id || result.status !== expected)
        throw new Error('Atualize o cadastro para conferir a alteração.')
    },
  }
}
