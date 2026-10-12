import type { RankingListProps } from '../../types/ranking'
import { formatRankingLiters } from '../../utils/rankingRules'
import styles from './styles.module.css'

export default function RankingList({ entries, establishmentId }: RankingListProps) {
  return (
    <section aria-label="Classificação dos estabelecimentos" className={styles.list}>
      {entries.map((entry) => (
        <article
          key={entry.establishmentId}
          className={`${styles.row} ${entry.establishmentId === establishmentId ? styles.own : ''}`}
        >
          <span className={styles.rank} aria-label={`Posição ${entry.rank}`}>
            #{entry.rank}
          </span>
          <div className={styles.name}>
            <h3>
              {entry.name}
              {entry.establishmentId === establishmentId && <span>Seu estabelecimento</span>}
            </h3>
            <p>{entry.city}</p>
          </div>
          <strong>{formatRankingLiters(entry.confirmedLiters)} L</strong>
        </article>
      ))}
    </section>
  )
}
