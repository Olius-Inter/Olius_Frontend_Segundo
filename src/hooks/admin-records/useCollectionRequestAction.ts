import { useEffect, useRef, useState } from 'react'
import type {
  AdminActionFormProps,
  AdminActionInput,
  CollectionRequestAction,
} from '../../types/admin-records/admin'
import { actOnAdminRecord } from '../../services/admin-records/adminService'
import { validateAdminAction } from '../../utils/admin-records/adminValidation'
import { CoreError } from '../../services/coreClient'
import { scheduleInputToIso, toScheduleInput } from '../../utils/scheduleInput'
import { useUnsavedForm } from '../useUnsavedForm'

export function useCollectionRequestAction({ resource, detail, onSaved }: AdminActionFormProps) {
  const initial = toScheduleInput(detail.request?.scheduledAt)
  const [scheduledAt, setScheduledAt] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState({ busy: false, error: '', conflict: false })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useUnsavedForm(scheduledAt !== initial && !feedback.busy)
  useEffect(() => () => controller.current?.abort(), [])
  const submit = async (action: CollectionRequestAction) => {
    if (lock.current || feedback.conflict) return
    const input: AdminActionInput = {
      action,
      ...(detail.revision !== null ? { expectedRevision: detail.revision } : {}),
      ...(['approve', 'reschedule'].includes(action)
        ? { scheduledAt: scheduleInputToIso(scheduledAt) }
        : {}),
    }
    const error = validateAdminAction(detail, input, resource)
    if (error) {
      setFeedback({ busy: false, error, conflict: false })
      return
    }
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '', conflict: false })
    try {
      await actOnAdminRecord(resource, detail, input, controller.current.signal)
      if (!controller.current.signal.aborted) onSaved()
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error:
            error instanceof Error ? error.message : 'Não foi possível atualizar a solicitação.',
          conflict: error instanceof CoreError && error.status === 409,
        })
    } finally {
      lock.current = false
    }
  }
  return { scheduledAt, setScheduledAt, editing, setEditing, feedback, submit }
}
