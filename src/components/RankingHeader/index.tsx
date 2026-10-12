import { Medal, Trophy } from 'lucide-react'
import type { RankingHeaderProps } from '../../types/ranking'
import { formatRankingLiters } from '../../utils/rankingRules'
import styles from './styles.module.css'

export default function RankingHeader({ data }: RankingHeaderProps) {
  const own = data?.ownPosition
  return (
    <header className={styles.hero}>
      <Trophy className={styles.decoration} size={210} strokeWidth={1.4} aria-hidden="true" />
      <p className={styles.category}>Estabelecimentos · B2B</p>
      <h1>Ranking de Recicladores</h1>
      <p>Veja os estabelecimentos que mais contribuíram com coletas confirmadas.</p>
      <div className={styles.position}>
        <Medal size={23} aria-hidden="true" />
        <span>
          Posição do seu estabelecimento:{' '}
          <strong>{own?.rank === null || own?.rank === undefined ? '—' : `#${own.rank}`}</strong> ·{' '}
          <strong>
            {own?.confirmedLiters === null || own?.confirmedLiters === undefined
              ? '—'
              : formatRankingLiters(own.confirmedLiters)}{' '}
            L
          </strong>
        </span>
      </div>
    </header>
  )
}
