import { Medal, Trophy } from 'lucide-react'
import type { RankingFiltersProps, RankingPeriod } from '../../types/ranking'
import { rankingPeriodLabels } from '../../utils/rankingRules'
import styles from './styles.module.css'

export default function RankingFilters({
  query,
  view,
  onChange,
  onViewChange,
}: RankingFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.periods} role="group" aria-label="Período do ranking">
        {(Object.keys(rankingPeriodLabels) as RankingPeriod[]).map((period) => (
          <button
            type="button"
            key={period}
            aria-pressed={query.period === period}
            onClick={() => onChange({ period })}
          >
            {rankingPeriodLabels[period]}
          </button>
        ))}
      </div>
      <div className={styles.views} role="group" aria-label="Conteúdo do ranking">
        <button
          type="button"
          aria-pressed={view === 'competitions'}
          onClick={() => onViewChange('competitions')}
        >
          <Medal size={20} aria-hidden="true" />
          Competições
        </button>
        <button
          type="button"
          aria-pressed={view === 'achievements'}
          onClick={() => onViewChange('achievements')}
        >
          <Trophy size={20} aria-hidden="true" />
          Conquistas
        </button>
      </div>
    </div>
  )
}
