import { useCallback, useEffect, useState } from 'react'
import { useAbortableResource } from './useAbortableResource'
import { getB2BHome, b2bEndpoints } from '../services/b2bHomeService'
import { canViewB2BOffers } from '../utils/b2bHomeRules'

export function useB2BHome() {
  const resource = useAbortableResource(getB2BHome)
  const [now, setNow] = useState(Date.now)
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  const collector = data?.collector ?? null
  useEffect(() => {
    setNow(Date.now())
    if (!collector) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [collector])
  const reload = useCallback(() => resource.reload(), [resource.reload])
  return {
    resource,
    data,
    reload,
    showOffers: data ? canViewB2BOffers(collector, data.establishment.id, now) : false,
    registerEnabled: Boolean(data?.canRegisterOil && b2bEndpoints.register),
    requestEnabled: Boolean(
      data?.oilStock.canRequestCollection &&
        data.oilStock.availableLiters !== null &&
        data.oilStock.minimumCollectionLiters !== null &&
        b2bEndpoints.request,
    ),
  }
}
