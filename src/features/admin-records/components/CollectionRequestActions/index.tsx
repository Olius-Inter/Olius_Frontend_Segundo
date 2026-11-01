import { useEffect } from 'react'
import type { AdminActionFormProps } from '../../types/admin'
import { useCollectionRequestAction } from '../../hooks/useCollectionRequestAction'
import styles from './styles.module.css'

export default function CollectionRequestActions(props: AdminActionFormProps) {
  const { detail, onRefresh, onBusyChange } = props
  const { scheduledAt, setScheduledAt, editing, setEditing, feedback, submit } =
    useCollectionRequestAction(props)
  const canApprove = detail.actions.includes('approve')
  const canReject = detail.actions.includes('reject')
  const canRestore = detail.actions.includes('restore')
  const canEdit = detail.actions.includes('reschedule')
  useEffect(() => {
    onBusyChange?.(feedback.busy)
  }, [feedback.busy, onBusyChange])
  if (!canApprove && !canReject && !canRestore && !canEdit) return null
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void submit(canApprove ? 'approve' : 'reschedule')
      }}
    >
      {canRestore && <p>Recupere a solicitação para analisar e programar uma nova coleta.</p>}
      {(canApprove || editing) && (
        <label>
          Data e horário programados para a coleta
          <input
            type="datetime-local"
            required
            disabled={feedback.busy || feedback.conflict}
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </label>
      )}
      {feedback.error && <p role="alert">{feedback.error}</p>}
      {feedback.conflict ? (
        <button type="button" className={styles.secondary} onClick={onRefresh}>
          Atualizar solicitação
        </button>
      ) : (
        <div className={styles.actions}>
          {canReject && (
            <button
              type="button"
              className={styles.reject}
              disabled={feedback.busy}
              onClick={() => {
                void submit('reject')
              }}
            >
              Rejeitar
            </button>
          )}
          {canApprove && (
            <button type="submit" className={styles.approve} disabled={feedback.busy}>
              Aprovar coleta
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              className={styles.secondary}
              disabled={feedback.busy}
              onClick={() => {
                void submit('restore')
              }}
            >
              Recuperar solicitação
            </button>
          )}
          {canEdit && !editing && (
            <button type="button" className={styles.secondary} onClick={() => setEditing(true)}>
              Editar agendamento
            </button>
          )}
          {canEdit && editing && (
            <>
              <button
                type="button"
                className={styles.secondary}
                disabled={feedback.busy}
                onClick={() => setEditing(false)}
              >
                Cancelar edição
              </button>
              <button type="submit" className={styles.approve} disabled={feedback.busy}>
                Salvar agendamento
              </button>
            </>
          )}
        </div>
      )}
      {feedback.busy && <p role="status">Atualizando solicitação…</p>}
    </form>
  )
}
