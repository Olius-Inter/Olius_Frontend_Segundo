import { Bell, CalendarDays, FileClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NotificationCardProps } from '../../types/notifications'
import { formatAdminValue } from '../../../admin-records'
import styles from './styles.module.css'

export default function NotificationCard({
  notification,
  compact = false,
  busy,
  canRead,
  onRead,
}: NotificationCardProps) {
  const Icon =
    notification.category === 'AGENDA'
      ? CalendarDays
      : notification.category === 'REQUESTS'
        ? FileClock
        : Bell
  const Heading = compact ? 'h3' : 'h2'
  return (
    <article
      className={`${styles.card} ${!notification.read ? styles.unread : ''} ${compact ? styles.compact : ''}`}
    >
      <span className={styles.icon}>
        <Icon size={21} aria-hidden="true" />
      </span>
      <div className={styles.body}>
        <div className={styles.title}>
          <Heading>{notification.title}</Heading>
          {!notification.read && <span>Não lida</span>}
        </div>
        <p>{notification.description}</p>
        <time dateTime={notification.date}>{formatAdminValue(notification.date, 'date')}</time>
        <div className={styles.actions}>
          {notification.href && (
            <Link
              to={notification.href}
              onClick={() => {
                if (!notification.read && canRead) onRead(notification.id)
              }}
            >
              Conferir aviso
            </Link>
          )}
          {!notification.read && (
            <button
              type="button"
              disabled={busy || !canRead}
              onClick={() => onRead(notification.id)}
            >
              Marcar como lida
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
