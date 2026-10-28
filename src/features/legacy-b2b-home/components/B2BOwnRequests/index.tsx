import sharedStyles from '../../../../shared/styles/shared.module.css'
import styles from './styles.module.css'
import { mapClassNames } from '../../../../shared/lib/classNames'
import { useState } from 'react'
import { Truck } from 'lucide-react'
import type { B2BOwnRequestsProps, B2BRequestStatus } from '../../types/b2bHome'
import { formatB2BDate, formatB2BNumber } from '../../lib/b2bHomeRules'

const classStyles = { ...sharedStyles, ...styles }

const statusLabels: Record<B2BRequestStatus, string> = {
  PENDING: 'Aguardando aprovação',
  APPROVED: 'Aprovada',
  ASSIGNED: 'Coletor designado',
  ARRIVED: 'Chegada registrada',
  COLLECTED: 'Coleta confirmada',
  REJECTED: 'Rejeitada',
  CANCELLED: 'Cancelada',
}
export default function B2BOwnRequests({ requests, total, connected }: B2BOwnRequestsProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? requests : requests.slice(0, 3)
  return (
    <section className="card b2b-own-requests" aria-labelledby="b2b-requests-title">
      <div className={sharedStyles['b2b-section-heading']}>
        <h2 id="b2b-requests-title">
          <Truck size={18} aria-hidden="true" />
          Minhas solicitações
        </h2>
        <span>{connected ? total : '—'}</span>
      </div>
      {!visible.length ? (
        <p className={sharedStyles['b2b-empty-text']}>
          {connected
            ? 'Nenhuma solicitação recente para este estabelecimento.'
            : 'Seus pedidos aparecerão após conectar sua conta.'}
        </p>
      ) : (
        <ul className={styles['b2b-requests-list']}>
          {visible.map((request) => (
            <li key={request.id}>
              <div>
                <strong>{formatB2BNumber(request.estimatedLiters)} L</strong>
                <small>{formatB2BDate(request.createdAt)} · volume estimado</small>
              </div>
              <span
                className={mapClassNames(
                  `b2b-request-status b2b-status-${request.status.toLowerCase()}`,
                  classStyles,
                )}
              >
                {statusLabels[request.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
      {requests.length > 3 && (
        <button
          type="button"
          className={sharedStyles['b2b-text-button']}
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? 'Mostrar resumo' : 'Ver mais solicitações recentes'}
        </button>
      )}
      {connected && total > requests.length && (
        <p className={sharedStyles['b2b-summary-note']}>
          Mostrando os {requests.length} pedidos mais recentes de {total}.
        </p>
      )}
    </section>
  )
}
