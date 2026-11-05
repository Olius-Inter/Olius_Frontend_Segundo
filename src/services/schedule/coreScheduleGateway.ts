import type { ScheduleGateway } from '../../types/schedule/schedule'
import { allPages, address, profileLookup, string } from '../core/coreData'
import { request, requestsPath } from '../admin-records/coreRequestsResource'
import { brasiliaDate } from '../../utils/date'

export function createCoreScheduleGateway(): ScheduleGateway {
  return {
    calendar: {
      list: async (query, signal) => {
        // O filtro de período da API usa requestAt, não scheduledAt: não o aplicar à agenda.
        const rows = await allPages(
          requestsPath,
          new URLSearchParams({ status: 'APPROVED' }),
          signal,
        )
        const selected = rows
          .map(request)
          .filter(
            (row) =>
              row.scheduledAt &&
              brasiliaDate(row.scheduledAt) >= query.from &&
              brasiliaDate(row.scheduledAt) <= query.to,
          )
        const lookup = profileLookup(signal)
        const events = []
        for (const row of selected) {
          signal.throwIfAborted()
          const profile = await lookup(row.establishmentId)
          events.push({
            id: row.id,
            requestId: row.id,
            title: profile ? string(profile.name) : `Estabelecimento ${row.establishmentId}`,
            address: address(profile),
            startsAt: row.scheduledAt!,
            endsAt: null,
            revision: null,
            completed: row.collectionId !== null,
            canReschedule: false,
          })
        }
        events.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id))
        return { events, total: events.length, complete: true }
      },
    },
  }
}
