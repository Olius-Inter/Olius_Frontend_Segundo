import type { HistoryRowProps } from '../../types/history'
import HistoryStatusBadge from '../HistoryStatusBadge'
import styles from './styles.module.css'

export default function HistoryRow({ record }: HistoryRowProps) {
  const confirmed = record.status === 'COLLECTED' || record.status === 'PROCESSED'
  const liters = confirmed ? record.confirmedLiters : record.estimatedLiters
  return (
    <tr>
      <td>
        <time dateTime={record.date}>
          {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(
            new Date(record.date),
          )}
        </time>
      </td>
      <td>
        {liters === null
          ? '—'
          : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(liters)} L`}
        <span className={styles.volume}>{confirmed ? 'Confirmado' : 'Estimado'}</span>
      </td>
      <td>
        <HistoryStatusBadge status={record.status} />
      </td>
    </tr>
  )
}
