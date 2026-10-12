import type { RankingPeriod, RankingQuery } from '../types/ranking'

export const rankingPeriodLabels: Record<RankingPeriod, string> = {
  MONTH: 'Este mês',
  YEAR: 'Este ano',
  ALL: 'Geral',
}
export const formatRankingLiters = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
export function validRankingQuery(query: RankingQuery): boolean {
  return (
    Object.hasOwn(rankingPeriodLabels, query.period) &&
    Number.isInteger(query.month) &&
    query.month >= 1 &&
    query.month <= 12 &&
    Number.isInteger(query.year) &&
    query.year >= 2000 &&
    query.year <= 2100 &&
    Number.isSafeInteger(query.page) &&
    query.page >= 1 &&
    query.page <= 100000 &&
    query.pageSize === 10
  )
}
