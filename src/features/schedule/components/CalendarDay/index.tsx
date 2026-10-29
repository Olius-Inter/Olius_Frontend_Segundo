import { useId } from 'react'
import { Clock, MapPin, TriangleAlert } from 'lucide-react'
import type { CalendarDayProps } from '../../types/schedule'
import { eventsOnDay, eventTime, overlapping } from '../../lib/calendar'
import styles from './styles.module.css'

export default function CalendarDay({ events, date, onSelectEvent }: CalendarDayProps) {
  const titleId = useId()
  const items = eventsOnDay(events, date)
  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div>
        <p>VISITAS DO DIA</p>
        <h2 id={titleId}>
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' }).format(
            new Date(`${date}T12:00:00Z`),
          )}
        </h2>
        <span>{items.length} visitas</span>
      </div>
      {items.length === 0 ? (
        <p>Nenhuma visita exibida para este dia.</p>
      ) : (
        <div className={styles.list}>
          {items.map((event) => (
            <article key={event.id} className={styles.event}>
              <div className={styles.time}>
                <Clock size={17} aria-hidden="true" />
                <time dateTime={event.startsAt}>
                  {eventTime(event.startsAt)}
                  {event.endsAt ? `–${eventTime(event.endsAt)}` : ''}
                </time>
              </div>
              <h3>{event.title}</h3>
              <p>
                <MapPin size={15} aria-hidden="true" />
                {event.address}
              </p>
              {overlapping(event, items) && (
                <p className={styles.overlap}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  Horário coincidente com outra visita
                </p>
              )}
              {!event.endsAt && <small>Duração não informada</small>}
              <button type="button" onClick={() => onSelectEvent(event)}>
                {event.completed ? 'Consultar visita' : 'Ver visita / reagendar'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
