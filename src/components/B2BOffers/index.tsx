import styles from '../../../styles/components/B2BOffers/styles.module.css'
import sharedStyles from '../../../styles/shared.module.css'
import { MapPin, CalendarDays, RefreshCw, Truck } from 'lucide-react'
import type { B2BOffersProps } from '../../types/legacy-b2b-home/b2bHome'
import { useB2BOffers } from '../../hooks/legacy-b2b-home/useB2BOffers'
import { formatB2BNumber, formatB2BWindow } from '../../utils/legacy-b2b-home/b2bHomeRules'
import B2BHomeNotice from '../B2BHomeNotice'

export default function B2BOffers({ data, onChanged }: B2BOffersProps) {
  const { state, reload, action, setAction, respond } = useB2BOffers({ data, onChanged })

  return (
    <section
      className={styles['b2b-offers']}
      aria-labelledby="b2b-offers-title"
      aria-busy={state.phase === 'loading' || action.pending !== null}
    >
      <div className={sharedStyles['b2b-section-heading']}>
        <div>
          <h2 id="b2b-offers-title">Coletas disponíveis</h2>
          <p>Ofertas elegíveis para seu estabelecimento coletor.</p>
        </div>
        <button
          type="button"
          className={styles['b2b-outline-button']}
          disabled={action.pending !== null || state.phase === 'loading'}
          onClick={() => {
            setAction((previous) => ({ ...previous, error: null }))
            reload()
          }}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>
      {action.error && <B2BHomeNotice kind="error">{action.error}</B2BHomeNotice>}
      {state.phase === 'loading' && (
        <B2BHomeNotice>Consultando as coletas disponíveis…</B2BHomeNotice>
      )}
      {state.phase === 'error' && <B2BHomeNotice kind="error">{state.message}</B2BHomeNotice>}
      {state.phase === 'ready' && (
        <>
          {!state.data.items.length ? (
            <div className={['card', styles['b2b-offers-empty']].join(' ')}>
              <Truck size={28} aria-hidden="true" />
              <h3>Nenhuma oferta disponível</h3>
              <p>
                Novas coletas aparecerão conforme a região e as permissões do seu credenciamento.
              </p>
            </div>
          ) : (
            <ul className={styles['b2b-offers-grid']}>
              {state.data.items.slice(0, 3).map((offer) => {
                const expired =
                  (offer.expiresAt !== null && Date.parse(offer.expiresAt) <= Date.now()) ||
                  Date.parse(offer.windowEnd) <= Date.now()
                const disabled =
                  action.pending !== null || expired || !data.collector?.canAcceptOffers
                return (
                  <li className={['card', styles['b2b-offer-card']].join(' ')} key={offer.id}>
                    <div className={styles['b2b-offer-heading']}>
                      <h3>{offer.establishmentName}</h3>
                      <strong>
                        {formatB2BNumber(offer.estimatedLiters)} L<small>volume estimado</small>
                      </strong>
                    </div>
                    <p>
                      <MapPin size={16} aria-hidden="true" />
                      {offer.regionLabel}
                    </p>
                    <p>
                      <CalendarDays size={16} aria-hidden="true" />
                      <span>
                        {formatB2BWindow(offer.windowStart)}
                        <br />
                        até {formatB2BWindow(offer.windowEnd)} (Brasília)
                      </span>
                    </p>
                    {expired && (
                      <span className={styles['b2b-expired-label']}>Oferta expirada</span>
                    )}
                    <div className={styles['b2b-offer-actions']}>
                      <button
                        type="button"
                        className="button"
                        disabled={disabled}
                        onClick={() => void respond(offer, 'accept')}
                      >
                        {action.pending === `${offer.id}:accept` ? 'Aceitando…' : 'Aceitar coleta'}
                      </button>
                      <button
                        type="button"
                        className={styles['b2b-decline-button']}
                        disabled={disabled}
                        onClick={() => void respond(offer, 'decline')}
                      >
                        {action.pending === `${offer.id}:decline` ? 'Recusando…' : 'Recusar oferta'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {state.data.total > 3 && (
            <p className={sharedStyles['b2b-summary-note']}>
              Exibindo até 3 ofertas recentes de {state.data.total} disponíveis.
            </p>
          )}
          <p className={sharedStyles['b2b-summary-note']}>
            Recusar uma oferta afeta apenas seu estabelecimento. O aceite será confirmado pelo
            Olius.
          </p>
        </>
      )}
    </section>
  )
}
