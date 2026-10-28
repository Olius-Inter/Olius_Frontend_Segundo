export interface CalendarQuery {
  from: string
  to: string
}

export interface CalendarEvent {
  id: string
  requestId: string
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  revision: number
  completed: boolean
  canReschedule: boolean
}

export interface CalendarData {
  events: CalendarEvent[]
  complete: boolean
  total: number
}

export interface RescheduleInput {
  startsAt: string
  expectedRevision: number
}

export interface CalendarBoardProps {
  events: CalendarEvent[]
  month: string
  selected: string
  onSelectDay: (date: string) => void
  onSelectEvent: (event: CalendarEvent) => void
}

export interface CalendarDayProps {
  events: CalendarEvent[]
  date: string
  onSelectEvent: (event: CalendarEvent) => void
}

export interface ScheduleDialogProps {
  event: CalendarEvent | null
  onClose: () => void
  onSaved: () => void
}
export interface ScheduleGateway {
  calendar?: {
    list: (query: CalendarQuery, signal: AbortSignal) => Promise<CalendarData>
    reschedule?: (
      event: CalendarEvent,
      input: RescheduleInput,
      signal: AbortSignal,
    ) => Promise<void>
  }
}
