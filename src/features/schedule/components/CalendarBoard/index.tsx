import type { CalendarBoardProps } from '../../types/schedule'
import { brasiliaDate } from '../../../../shared/lib/date'
import { eventTime, eventsOnDay, monthDays } from '../../lib/calendar'
import styles from './styles.module.css'

export default function CalendarBoard({
  events,
  month,
  selected,
  onSelectDay,
  onSelectEvent,
}: CalendarBoardProps) {
  const today = brasiliaDate()
  return (
    <section aria-label="Calendário mensal" className={styles.board}>
      <div className={styles.weekdays}>
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {monthDays(month).map((date) => {
          const dayEvents = eventsOnDay(events, date)
          return (
            <div
              key={date}
              className={`${styles.day} ${date.slice(0, 7) !== month ? styles.outside : ''} ${selected === date ? styles.selected : ''}`}
            >
              <button
                type="button"
                className={`${styles.number} ${date === today ? styles.today : ''}`}
                aria-pressed={selected === date}
                aria-label={`${Number(date.slice(-2))}, ${dayEvents.length} visitas`}
                onClick={() => onSelectDay(date)}
              >
                {Number(date.slice(-2))}
              </button>
              {dayEvents.slice(0, 2).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={`${styles.event} ${event.completed ? styles.completed : ''}`}
                  onClick={() => onSelectEvent(event)}
                >
                  <time dateTime={event.startsAt}>{eventTime(event.startsAt)}</time>
                  <span>{event.title}</span>
                </button>
              ))}
              {dayEvents.length > 2 && (
                <button type="button" className={styles.more} onClick={() => onSelectDay(date)}>
                  +{dayEvents.length - 2} visitas
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
