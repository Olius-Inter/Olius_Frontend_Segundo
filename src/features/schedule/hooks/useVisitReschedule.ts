import { useEffect, useRef, useState } from 'react'
import type { CalendarEvent } from '../types/schedule'
import { rescheduleVisit } from '../api/scheduleService'

export function useVisitReschedule(event: CalendarEvent | null, onSaved: () => void) {
  const [values, setValues] = useState({ when: '', agreed: '', reason: '' })
  const [feedback, setFeedback] = useState({ busy: false, error: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useEffect(() => {
    setValues({ when: '', agreed: '', reason: '' })
    setFeedback({ busy: false, error: '' })
  }, [event])
  useEffect(() => () => controller.current?.abort(), [])
  const save = async () => {
    if (!event || lock.current) return
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '' })
    try {
      const startsAt = new Date(values.when)
      const agreedAt = new Date(values.agreed)
      if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(agreedAt.getTime()))
        throw new Error('Informe as datas e os horários.')
      await rescheduleVisit(
        event,
        {
          startsAt: startsAt.toISOString(),
          agreedAt: agreedAt.toISOString(),
          reason: values.reason.trim(),
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
  return { values, setValues, feedback, save }
}
