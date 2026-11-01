import { useCallback, useEffect, useRef, useState } from 'react'
import type { B2BOffer, B2BOffersProps } from '../../types/legacy-b2b-home/b2bHome'
import { useAbortableResource } from '../useAbortableResource'
import {
  B2BServiceError,
  getB2BOffers,
  respondB2BOffer,
} from '../../services/legacy-b2b-home/b2bHomeService'
import { canViewB2BOffers } from '../../utils/legacy-b2b-home/b2bHomeRules'

export function useB2BOffers({ data, onChanged }: B2BOffersProps) {
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

  return { state, reload, action, setAction, respond }
}
