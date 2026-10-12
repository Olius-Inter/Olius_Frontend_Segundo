import { useCallback, useState } from 'react'
import type { RankingQuery, RankingView } from '../types/ranking'
import { getRanking } from '../services/rankingService'
import { validRankingQuery } from '../utils/rankingRules'
import { useAbortableResource } from './useAbortableResource'

export function useRanking() {
  const [query, setQuery] = useState<RankingQuery>(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).formatToParts(new Date())
    return {
      period: 'MONTH',
      month: Number(parts.find((part) => part.type === 'month')?.value),
      year: Number(parts.find((part) => part.type === 'year')?.value),
      page: 1,
      pageSize: 10,
    }
  })
  const [view, setView] = useState<RankingView>('competitions')
  const loader = useCallback((signal: AbortSignal) => getRanking(query, signal), [query])
  const resource = useAbortableResource(loader)
  const data =
    resource.state.phase === 'ready' && resource.state.data.kind === 'ready'
      ? resource.state.data.data
      : null
  const change = (patch: Partial<RankingQuery>) =>
    setQuery((previous) => {
      const next = { ...previous, ...patch, page: patch.page ?? 1, pageSize: 10 }
      return validRankingQuery(next) ? next : previous
    })
  return { query, change, view, setView, data, ...resource }
}
