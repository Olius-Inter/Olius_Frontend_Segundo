import styles from './styles.module.css'
import sharedStyles from '../../styles/shared.module.css'
import { Award } from 'lucide-react'
import type { B2BSustainabilityProps } from '../../types/b2bHome'
import { formatB2BNumber } from '../../utils/b2bHomeRules'

export default function B2BSustainability({ sustainability }: B2BSustainabilityProps) {
  return (
    <section
      className={['card', styles['b2b-sustainability']].join(' ')}
      aria-labelledby="b2b-sustainability-title"
    >
      <div className={styles['b2b-sustainability-heading']}>
        <span className={styles['b2b-award-icon']} aria-hidden="true">
          <Award size={28} />
        </span>
        <div>
          <h2 id="b2b-sustainability-title">Nível de sustentabilidade</h2>
          <p>{sustainability?.levelLabel ?? 'A confirmar'}</p>
        </div>
      </div>
      {sustainability ? (
        <>
          <div className={styles['b2b-progress-labels']}>
            <span>{formatB2BNumber(sustainability.progressLiters)} L confirmados</span>
            <span>Meta: {formatB2BNumber(sustainability.nextLevelLiters)} L</span>
          </div>
          <progress
            max={sustainability.nextLevelLiters}
            value={Math.min(sustainability.progressLiters, sustainability.nextLevelLiters)}
            aria-label="Progresso para o próximo nível"
          />
        </>
      ) : (
        <p className={sharedStyles['b2b-empty-text']}>
          O nível será exibido quando os critérios e as coletas confirmadas estiverem disponíveis.
        </p>
      )}
    </section>
  )
}
