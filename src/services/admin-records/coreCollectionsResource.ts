import { collectionSections } from './coreCollectionSections'
import type { AdminDetail, AdminResourceAdapter } from '../../types/admin-records/admin'
import {
  date,
  get,
  integer,
  noSearch,
  number,
  object,
  page,
  period,
  profileLookup,
  send,
  state,
  string,
  uuid,
} from '../core/coreData'

const path = '/api/v1/admin/collections'
function collection(value: unknown) {
  const data = object(value)
  const revision = integer(data.revision)
  if (revision < 1) throw new Error('Revisão da coleta inválida.')
  return {
    id: uuid(data.id),
    requestId: uuid(data.requestId),
    establishmentId: uuid(data.establishmentId),
    driverId: uuid(data.driverId),
    collected: number(data.collectedVolumeLiters),
    presented: number(data.presentedVolumeLiters),
    date: date(data.collectionDate),
    result: state(data.result, ['SUCCESSFUL', 'UNSUCCESSFUL']),
    status: state(data.recordStatus, ['RECORDED', 'ANNULLED']),
    revision,
    observation: data.observation === null ? null : string(data.observation),
  }
}
export function createCoreCollectionsResource(): AdminResourceAdapter {
  return {
    list: async (filters, signal) => {
      noSearch(filters.search)
      const params = period(filters.from, filters.to)
      if (filters.status)
        params.set('recordStatus', state(filters.status, ['RECORDED', 'ANNULLED']))
      const data = await page(path, params, filters.page - 1, filters.pageSize, signal)
      const lookup = profileLookup(signal)
      const items = await Promise.all(
        data.items.map(async (value) => {
          const row = collection(value)
          const profile = await lookup(row.establishmentId)
          const name = profile ? string(profile.name) : row.establishmentId
          return {
            id: row.id,
            title: `Coleta — ${name}`,
            cells: {
              date: row.date,
              establishment: name,
              driver: row.driverId,
              presentedLiters: row.presented,
              collectedLiters: row.collected,
              result: row.result,
              revision: row.revision,
              status: row.status,
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
      const data = object(await get(`${path}/${uuid(id)}`, signal))
      const row = collection(data.collection)
      if (row.id !== id) throw new Error('A API retornou outra coleta.')
      const profile = await profileLookup(signal)(row.establishmentId)
      return {
        id,
        title: `Coleta — ${profile ? string(profile.name) : row.establishmentId}`,
        revision: row.revision,
        actions: row.status === 'RECORDED' ? ['annul'] : [],
        history: [],
        sections: [
          ...collectionSections(data),
          {
            title: 'Registro físico',
            fields: [
              { label: 'Solicitação', value: row.requestId },
              { label: 'Motorista (ID)', value: row.driverId },
              { label: 'Coleta física', value: row.date, format: 'date' },
              { label: 'Apresentado', value: row.presented, format: 'liters' },
              { label: 'Recolhido', value: row.collected, format: 'liters' },
              { label: 'Resultado', value: row.result, format: 'status' },
              { label: 'Registro', value: row.status, format: 'status' },
              { label: 'Revisão operacional', value: row.revision },
              { label: 'Observação', value: row.observation },
            ],
          },
        ],
      }
    },
    act: async (id, input, signal) => {
      if (input.action !== 'annul' || !input.reason?.trim() || !input.expectedRevision)
        throw new Error('Anulação exige motivo e revisão da coleta.')
      const data = object(
        await (
          await send(
            `${path}/${uuid(id)}/annulments`,
            'POST',
            { expectedRevision: input.expectedRevision, justification: input.reason.trim() },
            signal,
          )
        ).json(),
      )
      const row = collection(data.collection)
      if (row.id !== id || row.status !== 'ANNULLED' || row.revision <= input.expectedRevision)
        throw new Error('Atualize a coleta para conferir a anulação.')
    },
  }
}
