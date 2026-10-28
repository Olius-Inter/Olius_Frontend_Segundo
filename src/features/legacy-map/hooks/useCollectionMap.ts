import { useCallback, useEffect, useRef, useState } from 'react'
import type { MapQuery } from '../types/collectionMap'
import { getCollectionMap } from '../api/collectionMapService'
import { sanitizeMapSearch, validMapQuery } from '../lib/collectionMapRules'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'

export function useCollectionMap() {
  const [query, setQuery] = useState<MapQuery>({
    search: '',
    latitude: null,
    longitude: null,
    radiusKm: 10,
    openNow: false,
    type: 'ALL',
    withSeal: false,
    page: 1,
    pageSize: 10,
  })
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState({ loading: false, message: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mounted = useRef(false)
  const locating = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const loader = useCallback((signal: AbortSignal) => getCollectionMap(query, signal), [query])
  const resource = useAbortableResource(loader)
  const change = useCallback((patch: Partial<MapQuery>) => {
    setSelectedId(null)
    setQuery((previous) => {
      const next = { ...previous, ...patch, page: patch.page ?? 1, pageSize: 10 }
      return validMapQuery(next) ? next : previous
    })
  }, [])
  const locate = () => {
    if (locating.current) return
    if (!navigator.geolocation) {
      setLocation({
        loading: false,
        message: 'Seu navegador não oferece localização. Busque pelo endereço.',
      })
      return
    }
    locating.current = true
    setLocation({ loading: true, message: '' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locating.current = false
        if (!mounted.current) return
        change({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          search: '',
        })
        setSearch('')
        setLocation({ loading: false, message: 'Localização utilizada somente nesta consulta.' })
      },
      (error) => {
        locating.current = false
        if (mounted.current)
          setLocation({
            loading: false,
            message:
              error.code === 1
                ? 'Localização não autorizada. Você pode buscar pelo endereço.'
                : 'Não foi possível obter sua localização. Busque pelo endereço.',
          })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  return {
    query,
    change,
    search,
    setSearch,
    location,
    locate,
    selectedId,
    select: setSelectedId,
    data,
    ...resource,
    submitSearch: () =>
      change({ search: sanitizeMapSearch(search), latitude: null, longitude: null }),
  }
}
