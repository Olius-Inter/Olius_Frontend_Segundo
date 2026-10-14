import { useCallback, useState } from 'react'
import type { HistoryQuery } from '../types/history'
import { getHistory } from '../services/historyService'
import { validHistoryQuery } from '../utils/historyRules'
import { useAbortableResource } from './useAbortableResource'

export function useHistory() {
  const [query, setQuery] = useState<HistoryQuery>(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).formatToParts(new Date())
    return {
      month: Number(parts.find((part) => part.type === 'month')?.value),
      year: Number(parts.find((part) => part.type === 'year')?.value),
      status: 'ALL',
      page: 1,
      pageSize: 10,
      scope: 'own',
    }
  })
  const loader = useCallback((signal: AbortSignal) => getHistory(query, signal), [query])
  const resource = useAbortableResource(loader)
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  const change = (patch: Partial<HistoryQuery>) => {
    if (patch.scope === 'collections' && !data?.allowedScopes.includes('collections')) return
    setQuery((previous) => {
      const next = { ...previous, ...patch, page: patch.page ?? 1, pageSize: 10 }
      return validHistoryQuery(next) ? next : previous
    })
  }
  return { query, change, data, ...resource }
}
