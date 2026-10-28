import { Check } from 'lucide-react'
import type { PlanCardProps } from '../../types/settings'
import styles from './styles.module.css'

export default function PortalPlanCard({ plan, annual, onSelect }: PlanCardProps) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice
  return (
    <article className={`${styles.card} ${plan.featured ? styles.featured : ''}`}>
      {plan.featured && <span className={styles.badge}>Em destaque</span>}
      <h3>{plan.name}</h3>
      <p>{plan.description}</p>
      <div className={styles.price}>
        <strong>
          {price === null
            ? '—'
            : new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              }).format(price)}
        </strong>
        <span>/{annual ? 'ano' : 'mês'}</span>
      </div>
      <button type="button" onClick={() => onSelect(plan)}>
        Ver detalhes do plano
      </button>
      <ul>
        {plan.liters !== null && (
          <li>
            <Check size={16} aria-hidden="true" />
            {plan.liters} L por ciclo
          </li>
        )}
        {plan.collections !== null && (
          <li>
            <Check size={16} aria-hidden="true" />
            {plan.collections} coletas por ciclo
          </li>
        )}
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}
