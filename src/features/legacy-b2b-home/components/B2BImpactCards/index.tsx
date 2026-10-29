import sharedStyles from '../../../../shared/styles/shared.module.css'
import styles from './styles.module.css'
import { mapClassNames } from '../../../../shared/lib/classNames'
import { Droplet, Droplets, Leaf, Flame } from 'lucide-react'
import type { B2BImpactCardsProps } from '../../types/b2bHome'
import { formatB2BNumber } from '../../lib/b2bHomeRules'

const classStyles = { ...sharedStyles, ...styles }

export default function B2BImpactCards({ impact, periodLabel }: B2BImpactCardsProps) {
  const metrics = [
    {
      id: 'oil',
      label: 'Óleo coletado',
      value: impact?.collectedLiters,
      unit: 'L',
      Icon: Droplet,
      help: 'Coletas confirmadas',
    },
    {
      id: 'water',
      label: 'Água preservada',
      value: impact?.preservedWaterLiters,
      unit: 'L',
      Icon: Droplets,
      help: 'Impacto informado pelo Olius',
    },
    {
      id: 'carbon',
      label: 'CO₂ evitado',
      value: impact?.avoidedCo2Kg,
      unit: 'kg',
      Icon: Leaf,
      help: 'Estimativa com fator validado',
    },
    {
      id: 'biodiesel',
      label: 'Biodiesel',
      value: impact?.confirmedBiodieselLiters,
      unit: 'L',
      Icon: Flame,
      help: 'Destinação confirmada',
    },
  ]
  return (
    <section aria-labelledby="b2b-impact-title">
      <div className={sharedStyles['b2b-section-heading']}>
        <h2 id="b2b-impact-title">Seu impacto</h2>
        <span>{periodLabel ?? 'Período a confirmar'}</span>
      </div>
      <div className={styles['b2b-impact-grid']}>
        {metrics.map(({ id, label, value, unit, Icon, help }) => (
          <article
            className={mapClassNames(`card b2b-metric b2b-metric-${id}`, classStyles)}
            key={id}
          >
            <div className={styles['b2b-metric-label']}>
              <Icon size={18} aria-hidden="true" />
              <h3>{label}</h3>
            </div>
            <p className={styles['b2b-metric-value']}>
              {value === null || value === undefined ? '—' : formatB2BNumber(value)}{' '}
              <span>{unit}</span>
            </p>
            <p className={styles['b2b-metric-help']}>
              {value === null || value === undefined ? 'Informação ainda indisponível' : help}
            </p>
            <Icon
              className={styles['b2b-metric-decoration']}
              size={95}
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </article>
        ))}
      </div>
    </section>
  )
}
