import type { AdminResult } from '../../../shared/types/result'
import type { CalendarData, CalendarEvent, CalendarQuery, RescheduleInput } from '../types/schedule'
import { portalGateway } from './scheduleGateway'

import { validDate } from '../../../shared/lib/validDate'

export async function getCalendar(
  query: CalendarQuery,
  signal: AbortSignal,
): Promise<AdminResult<CalendarData>> {
  try {
    signal.throwIfAborted()
    if (!validDate(query.from) || !validDate(query.to) || query.from > query.to)
      throw new Error('Período de agenda inválido.')
    if (!portalGateway.calendar) return unavailable
    const data = await portalGateway.calendar.list(query, signal)
    if (
      !data ||
      !Array.isArray(data.events) ||
      typeof data.complete !== 'boolean' ||
      !Number.isSafeInteger(data.total) ||
      data.total < data.events.length ||
      data.events.some(
        (e) =>
          !e ||
          typeof e.id !== 'string' ||
          typeof e.requestId !== 'string' ||
          typeof e.title !== 'string' ||
          typeof e.address !== 'string' ||
          !Number.isFinite(Date.parse(e.startsAt)) ||
          (e.endsAt !== null &&
            (!Number.isFinite(Date.parse(e.endsAt)) ||
              Date.parse(e.endsAt) <= Date.parse(e.startsAt))) ||
          !Number.isInteger(e.revision) ||
          e.revision < 1 ||
          typeof e.completed !== 'boolean' ||
          typeof e.canReschedule !== 'boolean',
      ) ||
      new Set(data.events.map((e) => e.id)).size !== data.events.length ||
      (data.complete && data.total !== data.events.length)
    )
      throw new Error('A agenda recebida é inválida.')
    return { kind: 'ready', data }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível consultar a agenda.')
  }
}

export async function rescheduleVisit(
  event: CalendarEvent,
  input: RescheduleInput,
  signal: AbortSignal,
): Promise<void> {
  try {
    if (!event.canReschedule || event.completed || input.expectedRevision !== event.revision)
      throw new Error('Releia a situação e a revisão atual antes de reagendar.')
    if (!Number.isFinite(Date.parse(input.startsAt)))
      throw new Error('Informe a data e o horário programados para a coleta.')
    if (!portalGateway.calendar?.reschedule)
      throw new Error('O reagendamento aguarda integração autorizada.')
    await portalGateway.calendar.reschedule(event, input, signal)
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível reagendar.')
  }
}
const unavailable = {
  kind: 'unavailable' as const,
  message:
    'A integração desta funcionalidade aguarda um contrato de API. Não há dados reais disponíveis.',
}
