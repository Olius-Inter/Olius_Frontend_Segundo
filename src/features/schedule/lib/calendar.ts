import { localDateKey } from '../../../shared/lib/date'
import { brasiliaDate } from '../../../shared/lib/date'
import type { CalendarEvent } from '../types/schedule'

export function monthDays(month: string): string[] {
  const [year, number] = month.split('-').map(Number)
  const first = new Date(year, number - 1, 1, 12)
  const start = new Date(year, number - 1, 1 - ((first.getDay() + 6) % 7), 12)
  const days = Math.ceil((((first.getDay() + 6) % 7) + new Date(year, number, 0).getDate()) / 7) * 7
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start)
    date.setDate(date.getDate() + index)
    return localDateKey(date)
  })
}

export function shiftMonth(month: string, shift: number): string {
  const [y, m] = month.split('-').map(Number)
  return localDateKey(new Date(y, m - 1 + shift, 1, 12)).slice(0, 7)
}

export const eventTime = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export function eventsOnDay(events: CalendarEvent[], day: string): CalendarEvent[] {
  return events
    .filter((event) => brasiliaDate(event.startsAt) === day)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id.localeCompare(b.id))
}

export function overlapping(event: CalendarEvent, events: CalendarEvent[]): boolean {
  return events.some(
    (other) =>
      other.id !== event.id &&
      (Date.parse(other.startsAt) === Date.parse(event.startsAt) ||
        (event.endsAt !== null &&
          other.endsAt !== null &&
          Date.parse(event.startsAt) < Date.parse(other.endsAt) &&
          Date.parse(other.startsAt) < Date.parse(event.endsAt))),
  )
}
