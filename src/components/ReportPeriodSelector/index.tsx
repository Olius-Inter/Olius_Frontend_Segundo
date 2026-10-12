import styles from './styles.module.css'
import { useReports } from '../../hooks/useReports'
import type { ReportPeriodSelectorProps } from '../../types/reports'

export default function ReportPeriodSelector({ onOpenPlans }: ReportPeriodSelectorProps) {
  const { preferences, changePreferences } = useReports()
  return (
    <section
      className={['card', styles['reports-values']].join(' ')}
      aria-labelledby="report-values-title"
    >
      <div>
        <h2 id="report-values-title">Valores</h2>
        <p>Escolha o período para visualizar os dados.</p>
      </div>
      <div
        className={styles['report-period-actions']}
        role="group"
        aria-label="Período dos relatórios"
      >
        <button
          type="button"
          className={styles['period-button']}
          aria-pressed={preferences.period === 'monthly'}
          onClick={() => changePreferences({ period: 'monthly' })}
        >
          Mensais
        </button>
        <button
          type="button"
          className={styles['period-button']}
          aria-pressed={preferences.period === 'yearly'}
          onClick={() => changePreferences({ period: 'yearly' })}
        >
          Anuais
        </button>
      </div>
      <button
        type="button"
        className={styles['report-plans-link']}
        onClick={onOpenPlans}
        aria-haspopup="dialog"
        aria-controls="report-plans-dialog"
      >
        Ver planos
      </button>
    </section>
  )
}
