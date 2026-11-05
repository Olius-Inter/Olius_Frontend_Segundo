import { scheduleInputToIso, toScheduleInput } from '../../utils/scheduleInput'
import { useEffect, useRef, useState } from 'react'
import type { CalendarEvent } from '../../types/schedule/schedule'
import { rescheduleVisit } from '../../services/schedule/scheduleService'
import { portalGateway } from '../../services/schedule/scheduleGateway'

export function useVisitReschedule(event: CalendarEvent | null, onSaved: () => void) {
  const [values, setValues] = useState({ when: toScheduleInput(event?.startsAt) })
  const [feedback, setFeedback] = useState({ busy: false, error: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useEffect(() => {
    setValues({ when: toScheduleInput(event?.startsAt) })
    setFeedback({ busy: false, error: '' })
  }, [event])
  useEffect(() => () => controller.current?.abort(), [])
  const save = async () => {
    if (!event || event.revision === null || lock.current) return
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '' })
    try {
      const startsAt = scheduleInputToIso(values.when)
      if (!startsAt) throw new Error('Informe a data e o horário programados para a coleta.')
      await rescheduleVisit(
        event,
        {
          startsAt,
          expectedRevision: event.revision,
        },
        controller.current.signal,
      )
      if (!controller.current.signal.aborted) onSaved()
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível reagendar.',
        })
    } finally {
      lock.current = false
    }
  }
  return {
    values,
    setValues,
    feedback,
    save,
    available: Boolean(portalGateway.calendar?.reschedule),
  }
}
