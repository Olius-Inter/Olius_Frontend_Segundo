import { useId } from 'react'
import { CalendarDays, Droplets, MapPin } from 'lucide-react'
import type { PendingRequestCardProps } from '../../types/admin-records/admin'
import { formatAdminValue } from '../../utils/admin-records/adminFormatting'
import styles from '../../../styles/components/PendingRequestCard/styles.module.css'

export default function PendingRequestCard({ record, onView }: PendingRequestCardProps) {
  const titleId = useId()
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.meta}>
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          Solicitada em {formatAdminValue(record.cells.requestAt, 'date')}
        </span>
        <span>
          <Droplets size={16} aria-hidden="true" />
          {formatAdminValue(record.cells.estimatedLiters, 'liters')} estimados
        </span>
      </div>
      <h3 id={titleId}>{record.title}</h3>
      <p className={styles.address}>
        <MapPin size={17} aria-hidden="true" />
        {formatAdminValue(record.cells.address)}
      </p>
      {onView && (
        <button type="button" aria-haspopup="dialog" onClick={() => onView(record.id)}>
          Consultar solicitação
        </button>
      )}
    </article>
  )
}
