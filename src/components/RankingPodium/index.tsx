import { Medal } from 'lucide-react'
import type { RankingPodiumProps } from '../../types/ranking'
import { formatRankingLiters } from '../../utils/rankingRules'
import styles from './styles.module.css'

export default function RankingPodium({ entries, establishmentId }: RankingPodiumProps) {
  return (
    <section aria-label="Destaques do ranking" className={styles.podium}>
      {entries.map((entry, index) => (
        <article
          key={entry.establishmentId}
          className={`${styles.place} ${styles[`place${index}`]}`}
        >
          {entry.establishmentId === establishmentId && (
            <span className={styles.own}>Seu estabelecimento</span>
          )}
          <Medal size={32} aria-hidden="true" />
          <span className={styles.rank}>#{entry.rank}</span>
          <div className={styles.avatar} aria-hidden="true">
            {entry.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word.slice(0, 1))
              .join('')
              .toLocaleUpperCase('pt-BR')}
          </div>
          <h3>{entry.name}</h3>
          <p>{entry.city}</p>
          <strong>{formatRankingLiters(entry.confirmedLiters)} L</strong>
        </article>
      ))}
    </section>
  )
}
