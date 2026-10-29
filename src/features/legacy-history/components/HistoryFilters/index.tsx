import type { HistoryFiltersProps, HistoryStatus } from '../../types/history'
import { historyLabels } from '../../lib/historyRules'
import styles from './styles.module.css'

export default function HistoryFilters({ query, onChange }: HistoryFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.period}>
        <label>
          Mês
          <select
            value={query.month}
            onChange={(event) => onChange({ month: Number(event.target.value) })}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index + 1}>
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(
                  new Date(Date.UTC(2026, index, 1)),
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ano
          <select
            value={query.year}
            onChange={(event) => onChange({ year: Number(event.target.value) })}
          >
            {Array.from({ length: 101 }, (_, index) => 2100 - index).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.statuses} role="group" aria-label="Filtrar por status">
        {(Object.keys(historyLabels) as HistoryStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={query.status === status}
            onClick={() => onChange({ status })}
          >
            {historyLabels[status]}
          </button>
        ))}
      </div>
    </div>
  )
}
