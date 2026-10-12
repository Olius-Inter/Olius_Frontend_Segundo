import styles from './styles.module.css'
import { Droplet, CircleCheck } from 'lucide-react'
import type { B2BOilStockProps } from '../../types/b2bHome'
import { formatB2BNumber } from '../../utils/b2bHomeRules'

export default function B2BOilStock({ stock }: B2BOilStockProps) {
  const available = stock?.availableLiters ?? null
  const minimum = stock?.minimumCollectionLiters ?? null
  const progress =
    available !== null && minimum !== null && minimum > 0
      ? Math.min((available / minimum) * 100, 100)
      : null
  return (
    <section
      className={['card', styles['b2b-stock-card']].join(' ')}
      aria-labelledby="b2b-stock-title"
    >
      <h2 id="b2b-stock-title">Óleo acumulado</h2>
      <div className={styles['b2b-stock-main']}>
        <div className={styles['b2b-stock-vessel']} aria-hidden="true">
          <span style={{ height: `${progress ?? 0}%` }} />
          <Droplet size={29} />
        </div>
        <div>
          <p className={styles['b2b-stock-value']}>
            {available === null ? '—' : formatB2BNumber(available)} <span>L</span>
          </p>
          <p className={styles['b2b-stock-caption']}>Disponível para nova coleta</p>
          <p className={styles['b2b-stock-minimum']}>
            {minimum === null
              ? 'Mínimo de coleta a confirmar'
              : `Mínimo vigente: ${formatB2BNumber(minimum)} L`}
          </p>
          {stock?.canRequestCollection ? (
            <span className={styles['b2b-ready-chip']}>
              <CircleCheck size={14} aria-hidden="true" />
              Pronto para solicitar coleta
            </span>
          ) : (
            <p className={styles['b2b-stock-reason']}>
              {stock?.blockedReason ?? 'A disponibilidade será confirmada pelo Olius.'}
            </p>
          )}
        </div>
      </div>
      <dl className={styles['b2b-stock-breakdown']}>
        <div>
          <dt>Em armazenamento</dt>
          <dd>
            {stock?.storedLiters === null || stock?.storedLiters === undefined
              ? '—'
              : `${formatB2BNumber(stock.storedLiters)} L`}
          </dd>
        </div>
        <div>
          <dt>Comprometido em pedidos</dt>
          <dd>
            {stock?.reservedLiters === null || stock?.reservedLiters === undefined
              ? '—'
              : `${formatB2BNumber(stock.reservedLiters)} L`}
          </dd>
        </div>
      </dl>
    </section>
  )
}
