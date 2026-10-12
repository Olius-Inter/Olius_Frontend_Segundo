export type RankingPeriod = 'MONTH' | 'YEAR' | 'ALL'
export type RankingView = 'competitions' | 'achievements'
export interface RankingQuery {
  period: RankingPeriod
  month: number
  year: number
  page: number
  pageSize: number
}
export interface RankingEntry {
  establishmentId: string
  name: string
  city: string
  rank: number
  confirmedLiters: number
}
export interface RankingAchievement {
  id: string
  title: string
  description: string
  earnedAt: string
}
export interface RankingData {
  accountType: 'B2B'
  establishment: { id: string; name: string }
  query: RankingQuery
  periodLabel: string
  criteria: string
  ownPosition: { rank: number | null; confirmedLiters: number | null } | null
  podium: RankingEntry[]
  items: RankingEntry[]
  total: number
  totalPages: number
  achievements: RankingAchievement[] | null
}
export type RankingResponse =
  | { kind: 'ready'; data: RankingData }
  | { kind: 'not-configured' | 'unauthenticated' | 'forbidden' }
export interface RankingHeaderProps {
  data: RankingData | null
}
export interface RankingFiltersProps {
  query: RankingQuery
  view: RankingView
  onChange: (patch: Partial<RankingQuery>) => void
  onViewChange: (view: RankingView) => void
}
export interface RankingPodiumProps {
  entries: RankingEntry[]
  establishmentId: string
}
export interface RankingListProps {
  entries: RankingEntry[]
  establishmentId: string
}
export interface RankingAchievementsProps {
  achievements: RankingAchievement[] | null
}
export interface RankingPaginationProps {
  page: number
  totalPages: number
  total: number
  onChange: (page: number) => void
}
