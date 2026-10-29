import { useCallback, useMemo, useState } from 'react'
import type { CalendarEvent } from '../types/schedule'
import { brasiliaDate } from '../../../shared/lib/date'
import { monthDays, shiftMonth } from '../lib/calendar'
import { getCalendar } from '../api/scheduleService'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'

export function useCalendar() {
  const today = brasiliaDate()
  const [month, setMonth] = useState(today.slice(0, 7))
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState<'month' | 'list'>('month')
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [message, setMessage] = useState('')
  const days = useMemo(() => monthDays(month), [month])
  const loader = useCallback(
    (signal: AbortSignal) => getCalendar({ from: days[0], to: days[days.length - 1] }, signal),
    [days],
  )
  const resource = useAbortableResource(loader)
  const move = (direction: number) => {
    const next = shiftMonth(month, direction)
    setMonth(next)
    setSelected(`${next}-01`)
    setMessage('')
  }
  const current = () => {
    setMonth(today.slice(0, 7))
    setSelected(today)
  }
  const saved = () => {
    setEvent(null)
    setMessage('Reagendamento concluído. Confira os dados atualizados na agenda.')
    resource.reload()
  }
  return {
    ...resource,
    month,
    selected,
    setSelected,
    view,
    setView,
    event,
    setEvent,
    move,
    current,
    saved,
    message,
  }
}
