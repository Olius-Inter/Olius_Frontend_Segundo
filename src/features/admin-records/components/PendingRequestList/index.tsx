import type { PendingRequestListProps } from '../../types/admin'
import PendingRequestCard from '../PendingRequestCard'
import styles from './styles.module.css'

export default function PendingRequestList({ records, total }: PendingRequestListProps) {
  return (
    <section className={styles.panel} aria-label="Solicitações aguardando análise">
      <header>
        <p className={styles.eyebrow}>SOLICITAÇÕES PENDENTES</p>
        <h3>
          {total} {total === 1 ? 'solicitação pendente' : 'solicitações pendentes'}
        </h3>
      </header>
      <div className={styles.list}>
        {records.map((record) => (
          <PendingRequestCard key={record.id} record={record} />
        ))}
      </div>
    </section>
  )
}
