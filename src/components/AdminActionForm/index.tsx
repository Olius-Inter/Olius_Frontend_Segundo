import { useId, useEffect } from 'react'
import type { AdminAction, AdminActionFormProps } from '../../types/admin-records/admin'
import { useAdminAction } from '../../hooks/admin-records/useAdminAction'
import styles from '../../../styles/components/AdminActionForm/styles.module.css'

const labels: Record<AdminAction, string> = {
  approve: 'Aprovar',
  reject: 'Rejeitar',
  restore: 'Recuperar solicitação',
  reschedule: 'Reagendar',
  cancel: 'Cancelar',
  activate: 'Ativar',
  inactivate: 'Inativar',
  correct: 'Corrigir',
  annul: 'Anular',
}
export default function AdminActionForm(props: AdminActionFormProps) {
  const fieldId = useId()

  const { detail, onRefresh, onBusyChange } = props
  const { allowed, values, setValues, feedback, scheduling, submit } = useAdminAction(props)
  useEffect(() => {
    onBusyChange?.(feedback.busy)
  }, [feedback.busy, onBusyChange])
  if (!detail.actions.length) return null
  return (
    <section className={styles.panel}>
      <h2>Ações autorizadas</h2>
      {detail.actions.includes('correct') && (
        <p>
          O formulário de correção depende dos campos autorizados no contrato específico desta
          operação.
        </p>
      )}
      {allowed.length > 0 && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <label htmlFor={`${fieldId}-field-1`}>
            Ação
            <select
              id={`${fieldId}-field-1`}
              value={values.action}
              disabled={feedback.busy}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  action: event.target.value as AdminAction,
                }))
              }
            >
              {allowed.map((action) => (
                <option key={action} value={action}>
                  {labels[action]}
                </option>
              ))}
            </select>
          </label>
          {scheduling && (
            <>
              <label htmlFor={`${fieldId}-field-2`}>
                Data e horário exatos da visita
                <input
                  id={`${fieldId}-field-2`}
                  disabled={feedback.busy}
                  type="datetime-local"
                  required
                  value={values.scheduledAt}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, scheduledAt: event.target.value }))
                  }
                />
              </label>
              <label htmlFor={`${fieldId}-field-3`}>
                Quando o horário foi combinado
                <input
                  id={`${fieldId}-field-3`}
                  disabled={feedback.busy}
                  type="datetime-local"
                  required
                  value={values.agreedAt}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, agreedAt: event.target.value }))
                  }
                />
              </label>
              <p>Os horários usam o fuso do seu navegador e serão enviados com UTC.</p>
            </>
          )}
          <label htmlFor={`${fieldId}-field-4`}>
            Motivo
            <textarea
              id={`${fieldId}-field-4`}
              disabled={feedback.busy}
              required
              minLength={3}
              maxLength={1000}
              value={values.reason}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, reason: event.target.value }))
              }
            />
          </label>
          {values.action === 'annul' && (
            <p>
              Revisão esperada: {detail.revision ?? 'Indisponível'}. O registro será preservado no
              histórico.
            </p>
          )}
          {feedback.error && <p role="alert">{feedback.error}</p>}
          {feedback.success && <p role="status">{feedback.success}</p>}
          {feedback.conflict ? (
            <button type="button" onClick={onRefresh}>
              Recarregar a revisão antes de continuar
            </button>
          ) : (
            <button type="submit" disabled={feedback.busy}>
              {feedback.busy ? 'Enviando…' : 'Confirmar ação'}
            </button>
          )}
        </form>
      )}
    </section>
  )
}
