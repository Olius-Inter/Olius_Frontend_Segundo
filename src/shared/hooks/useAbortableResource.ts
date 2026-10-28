import { useCallback, useEffect, useState } from 'react'
import type { AbortableResourceResult, ResourceState } from '../types/api'

export function useAbortableResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
): AbortableResourceResult<T> {
  const [result, setResult] = useState<{ loader: typeof loader; state: ResourceState<T> }>({
    loader,
    state: { phase: 'loading' },
  })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ loader, state: { phase: 'ready', data } })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            loader,
            state: {
              phase: 'error',
              message: error instanceof Error ? error.message : 'Falha ao carregar os dados.',
            },
          })
      })
    return () => controller.abort()
  }, [loader, revision])

  const reload = useCallback(() => {
    setResult({ loader, state: { phase: 'loading' } })
    setRevision((previous) => previous + 1)
  }, [loader])

  return { state: result.loader === loader ? result.state : { phase: 'loading' }, reload }
}
