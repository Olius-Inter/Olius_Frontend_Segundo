import styles from './styles.module.css'
import sharedStyles from '../../../../shared/styles/shared.module.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, CalendarDays, RefreshCw, Truck } from 'lucide-react'
import type { B2BOffer, B2BOffersProps } from '../../types/b2bHome'
import { useAbortableResource } from '../../../../shared/hooks/useAbortableResource'
import { B2BServiceError, getB2BOffers, respondB2BOffer } from '../../api/b2bHomeService'
import { canViewB2BOffers, formatB2BNumber, formatB2BWindow } from '../../lib/b2bHomeRules'
import B2BHomeNotice from '../B2BHomeNotice'

export default function B2BOffers({ data, onChanged }: B2BOffersProps) {
  const loader = useCallback(
    (signal: AbortSignal) => getB2BOffers(data.establishment.id, signal),
    [data.establishment.id],
  )
  const { state, reload } = useAbortableResource(loader)
  const abortRef = useRef<AbortController | null>(null)
  const busyRef = useRef(false)
  const keysRef = useRef(new Map<string, string>())
  const [action, setAction] = useState<{ pending: string | null; error: string | null }>({
    pending: null,
    error: null,
  })
  useEffect(() => () => abortRef.current?.abort(), [])

  async function respond(offer: B2BOffer, decision: 'accept' | 'decline') {
    if (busyRef.current) return
    if (
      !canViewB2BOffers(data.collector, data.establishment.id) ||
      !data.collector?.canAcceptOffers
    ) {
      onChanged({
        kind: 'error',
        message: 'Sua autorização de coletor precisa ser confirmada novamente.',
      })
      return
    }
    if (
      (offer.expiresAt !== null && Date.parse(offer.expiresAt) <= Date.now()) ||
      Date.parse(offer.windowEnd) <= Date.now()
    ) {
      setAction({
        pending: null,
        error: 'Esta oferta expirou. Consulte as coletas disponíveis novamente.',
      })
      reload()
      return
    }
    const actionId = `${offer.id}:${decision}`
    let key = keysRef.current.get(actionId)
    if (!key) {
      key = crypto.randomUUID()
      keysRef.current.set(actionId, key)
    }
    const controller = new AbortController()
    abortRef.current = controller
    busyRef.current = true
    setAction({ pending: actionId, error: null })
    try {
      await respondB2BOffer(offer.id, decision, data.establishment.id, controller.signal, key)
      if (!controller.signal.aborted)
        onChanged({
          kind: 'success',
          message:
            decision === 'accept'
              ? 'Coleta aceita. A retirada e o volume real serão confirmados na operação autorizada.'
              : 'Oferta recusada para seu estabelecimento.',
        })
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      const message =
        error instanceof Error ? error.message : 'Não foi possível responder à oferta.'
      if (error instanceof B2BServiceError && [401, 403].includes(error.status))
        onChanged({ kind: 'error', message })
      else {
        setAction({ pending: null, error: message })
        if (error instanceof B2BServiceError && error.status === 409) reload()
      }
    } finally {
      busyRef.current = false
      if (!controller.signal.aborted) setAction((previous) => ({ ...previous, pending: null }))
    }
  }

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
