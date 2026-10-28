import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ScheduleDialogProps } from '../../types/schedule'
import { useVisitReschedule } from '../../hooks/useVisitReschedule'
import { portalGateway } from '../../api/scheduleGateway'
import { formatAdminValue } from '../../../admin-records'
import styles from './styles.module.css'

export default function ScheduleDialog({ event, onClose, onSaved }: ScheduleDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { values, setValues, feedback, save } = useVisitReschedule(event, onSaved)
  useEffect(() => {
    if (event) {
      dialog.current?.showModal()
    } else dialog.current?.close()
  }, [event])

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="schedule-title"
      onCancel={(e) => {
        if (feedback.busy) {
          e.preventDefault()
          return
        }
        onClose()
      }}
      onClose={onClose}
    >
      {event && (
        <>
          <header>
            <h2 id="schedule-title">{event.title}</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={feedback.busy}
              aria-label="Fechar visita"
            >
              ×
            </button>
          </header>
          <p>{event.address}</p>
          <p>
            Horário atual: <strong>{formatAdminValue(event.startsAt, 'date')}</strong>
          </p>
          <Link to={`/operacao/solicitacoes/${event.requestId}`} onClick={onClose}>
            Abrir solicitação completa
          </Link>
          {event.canReschedule && !event.completed ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void save()
              }}
            >
              <h3>Reagendar visita</h3>
              <p>
                Informe a data e o horário da coleta combinados externamente com o estabelecimento.
              </p>
              <label>
                Data e horário programados para a coleta
                <input
                  disabled={feedback.busy}
                  autoFocus
                  type="datetime-local"
                  required
                  value={values.when}
                  onChange={(e) => setValues((previous) => ({ ...previous, when: e.target.value }))}
                />
              </label>
              <small>
                Os campos usam o fuso do navegador; a apresentação da agenda usa Brasília.
              </small>
              {feedback.error && <p role="alert">{feedback.error}</p>}
              <button type="submit" disabled={feedback.busy || !portalGateway.calendar?.reschedule}>
                {feedback.busy ? 'Reagendando…' : 'Confirmar reagendamento'}
              </button>
            </form>
          ) : (
            <p>Esta visita está disponível somente para consulta.</p>
          )}
        </>
      )}
    </dialog>
  )
}
