import { useEffect, useRef, useState } from 'react'
import type { AdminActionFormProps, AdminActionValues } from '../types/admin'
import { actOnAdminRecord } from '../api/adminService'
import { CoreError } from '../../../shared/api/coreClient'
import { validateAdminAction } from '../validation/adminValidation'
import { useUnsavedForm } from '../../../shared/hooks/useUnsavedForm'

export function useAdminAction({ resource, detail, onSaved }: AdminActionFormProps) {
  const allowed = detail.actions.filter((action) => action !== 'correct')
  const [values, setValues] = useState<AdminActionValues>({
    action: allowed[0] ?? 'approve',
    reason: '',
    scheduledAt: '',
    agreedAt: '',
  })
  const [feedback, setFeedback] = useState({ busy: false, error: '', conflict: false, success: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useUnsavedForm(
    Boolean(values.reason || values.scheduledAt || values.agreedAt) && !feedback.success,
  )
  useEffect(() => () => controller.current?.abort(), [])
  const scheduling =
    values.action === 'reschedule' ||
    (values.action === 'approve' && (resource === 'requests' || resource === 'agenda'))
  const submit = async () => {
    if (lock.current || feedback.conflict) return
    const iso = (value: string) =>
      Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined
    const input = {
      action: values.action,
      reason: values.reason.trim(),
      ...(values.action === 'annul' && detail.revision !== null
        ? { expectedRevision: detail.revision }
        : {}),
      ...(scheduling
        ? { scheduledAt: iso(values.scheduledAt), agreedAt: iso(values.agreedAt) }
        : {}),
    }
    const error = validateAdminAction(detail, input, resource)
    if (error) {
      setFeedback({ busy: false, error, conflict: false, success: '' })
      return
    }
    if (!window.confirm('Confirmar esta ação administrativa para o registro selecionado?')) return
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '', conflict: false, success: '' })
    try {
      await actOnAdminRecord(resource, detail, input, controller.current.signal)
      if (controller.current.signal.aborted) return
      setValues((previous) => ({ ...previous, reason: '' }))
      setFeedback({
        busy: false,
        error: '',
        conflict: false,
        success: 'Registro atualizado.',
      })
      onSaved()
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível concluir a ação.',
          conflict: error instanceof CoreError && error.status === 409,
          success: '',
        })
    } finally {
      lock.current = false
    }
  }
  return { allowed, values, setValues, feedback, scheduling, submit }
}
