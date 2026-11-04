import { useCallback, useEffect, useRef, useState } from 'react'
import { useAbortableResource } from '../useAbortableResource'
import { coreConfigured, localDemoEnabled } from '../../services/coreClient'
import { decidePev, listPendingPevs } from '../../services/pev/pevService'
import type { PendingPev, PevDecision, PevOwnerType } from '../../types/pev/pev'

export function usePevRequests(ownerType: PevOwnerType) {
  const [page, setPage] = useState(0)
  const [selection, setSelection] = useState<{ request: PendingPev; decision: PevDecision } | null>(
    null,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mutation = useRef<AbortController | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusAfterDecision = useRef(false)
  const available = coreConfigured && !localDemoEnabled
  const load = useCallback(
    (signal: AbortSignal) =>
      available ? listPendingPevs(ownerType, page, signal) : Promise.resolve(null),
    [available, ownerType, page],
  )
  const { state, reload } = useAbortableResource(load)
  const result = state.phase === 'ready' ? state.data : null

  useEffect(
    () => () => {
      mutation.current?.abort()
    },
    [],
  )
  useEffect(() => {
    if (state.phase !== 'loading' && focusAfterDecision.current) {
      focusAfterDecision.current = false
      heading.current?.focus()
    }
  }, [state.phase])

  function select(request: PendingPev, decision: PevDecision) {
    setError('')
    setNotice('')
    setSelection({ request, decision })
  }

  async function confirm() {
    if (!selection || mutation.current) return
    const controller = new AbortController()
    mutation.current = controller
    setBusy(true)
    setError('')
    try {
      await decidePev(selection.request.id, selection.decision, controller.signal)
      if (controller.signal.aborted) return
      setSelection(null)
      setNotice(
        selection.decision === 'APPROVED' ? 'Pedido de PEV aprovado.' : 'Pedido de PEV rejeitado.',
      )
      focusAfterDecision.current = true
      if (page > 0 && result?.items.length === 1) setPage(page - 1)
      else reload()
    } catch (failure: unknown) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error ? failure.message : 'Não foi possível registrar a decisão.',
        )
    } finally {
      mutation.current = null
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  return {
    page,
    setPage,
    selection,
    setSelection,
    busy,
    error,
    notice,
    heading,
    available,
    localDemoEnabled,
    state,
    result,
    reload,
    select,
    confirm,
  }
}
