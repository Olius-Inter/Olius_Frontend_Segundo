import type { AdminDetail, AdminResourceAdapter } from '../../types/admin-records/admin'
import {
  address,
  date,
  get,
  noSearch,
  number,
  object,
  page,
  period,
  profileLookup,
  state,
  string,
  uuid,
} from '../core/coreData'

export const requestsPath = '/api/v1/admin/collection-requests'
export function request(value: unknown) {
  const data = object(value)
  return {
    id: uuid(data.id),
    establishmentId: uuid(data.establishmentId),
    status: state(data.status, ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
    estimated: number(data.estimatedVolumeLiters),
    requestedAt: date(data.requestAt),
    updatedAt: date(data.updatedAt),
    scheduledAt: data.scheduledAt === null ? null : date(data.scheduledAt),
    observation: data.observation === null ? null : string(data.observation),
    collectionId: data.collectionId === null ? null : uuid(data.collectionId),
  }
}
export function createCoreRequestsResource(): AdminResourceAdapter {
  return {
    list: async (filters, signal) => {
      noSearch(filters.search)
      const params = period(filters.from, filters.to)
      if (filters.status)
        params.set(
          'status',
          state(filters.status, ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
        )
      const data = await page(requestsPath, params, filters.page - 1, filters.pageSize, signal)
      const lookup = profileLookup(signal)
      const items = await Promise.all(
        data.items.map(async (value) => {
          const row = request(value)
          const profile = await lookup(row.establishmentId)
          const title = profile ? string(profile.name) : `Estabelecimento ${row.establishmentId}`
          return {
            id: row.id,
            title,
            cells: {
              establishment: title,
              address: address(profile),
              requestAt: row.requestedAt,
              estimatedLiters: row.estimated,
              status: row.status,
              scheduledAt: row.scheduledAt,
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
    detail: async (id, _filters, signal): Promise<AdminDetail> => {
      const row = request(await get(`${requestsPath}/${uuid(id)}`, signal))
      if (row.id !== id) throw new Error('A API retornou outra solicitação.')
      const profile = await profileLookup(signal)(row.establishmentId)
      const telephone =
        profile && Array.isArray(profile.telephones) && typeof profile.telephones[0] === 'string'
          ? profile.telephones[0]
          : null
      return {
        id,
        title: profile ? string(profile.name) : `Solicitação ${id}`,
        revision: null,
        actions: [],
        history: [],
        request: {
          status: row.status,
          scheduledAt: row.scheduledAt,
          telephone,
          email: profile ? string(profile.email) : null,
        },
        sections: [
          {
            title: 'Solicitação',
            fields: [
              { label: 'Endereço', value: address(profile) },
              { label: 'Pedido', value: row.requestedAt, format: 'date' },
              { label: 'Estimado', value: row.estimated, format: 'liters' },
              { label: 'Situação', value: row.status, format: 'status' },
              { label: 'Agendamento', value: row.scheduledAt, format: 'date' },
              { label: 'Observação', value: row.observation },
              { label: 'Coleta vinculada', value: row.collectionId },
            ],
          },
        ],
      }
    },
  }
}
