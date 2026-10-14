import styles from './styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import { Building2, ChartColumnIncreasing, Leaf } from 'lucide-react'
import type { PlanCardProps } from '../../types/reports'
import { formatMoney } from '../../utils/reportFormatting'

const classStyles = { ...styles }

const icons = { basic: Leaf, professional: ChartColumnIncreasing, business: Building2 }
export default function PlanCard({ plan, period, selected, onChoose }: PlanCardProps) {
  const Icon = icons[plan.id]
  return (
    <article
      className={mapClassNames(`report-plan-card${selected ? ' selected' : ''}`, classStyles)}
      aria-labelledby={`plan-${plan.id}-title`}
    >
      <span className={styles['report-plan-icon']} aria-hidden="true">
        <Icon size={30} strokeWidth={1.5} />
      </span>
      <h3 id={`plan-${plan.id}-title`}>{plan.name}</h3>
      <p>{plan.description}</p>
      <span className={styles['report-plan-divider']} aria-hidden="true" />
      <div className={styles['report-plan-price']}>
        <strong>{formatMoney(plan.monthlyPriceCents * (period === 'yearly' ? 12 : 1))}</strong>
        <span>/{period === 'yearly' ? 'ano' : 'mês'}</span>
      </div>
      {period === 'yearly' && (
        <small className={styles['report-plan-year-note']}>
          Equivale a {formatMoney(plan.monthlyPriceCents)}/mês
        </small>
      )}
      <button
        type="button"
        className={styles['report-plan-choose']}
        aria-label={`Escolher ${plan.name}`}
        aria-pressed={selected}
        onClick={() => onChoose(plan.id)}
      >
        {selected ? 'Selecionar novamente' : 'Escolher plano'}
      </button>
    </article>
  )
}
