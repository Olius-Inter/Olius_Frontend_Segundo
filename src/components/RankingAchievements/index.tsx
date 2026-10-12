import { Trophy } from 'lucide-react'
import type { RankingAchievementsProps } from '../../types/ranking'
import PageFeedback from '../PageFeedback'
import styles from './styles.module.css'

export default function RankingAchievements({ achievements }: RankingAchievementsProps) {
  if (achievements === null)
    return (
      <PageFeedback
        kind="empty"
        title="Conquistas indisponíveis"
        description="As conquistas serão exibidas quando os critérios e os resultados forem disponibilizados pelo Olius."
      />
    )
  if (!achievements.length)
    return (
      <PageFeedback
        kind="empty"
        title="Nenhuma conquista neste período"
        description="As conquistas confirmadas do seu estabelecimento aparecerão aqui."
      />
    )
  return (
    <section aria-label="Conquistas do estabelecimento" className={styles.grid}>
      {achievements.map((achievement) => (
        <article className={styles.card} key={achievement.id}>
          <Trophy size={30} aria-hidden="true" />
          <h3>{achievement.title}</h3>
          <p>{achievement.description}</p>
          <time dateTime={achievement.earnedAt}>
            {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(
              new Date(achievement.earnedAt),
            )}
          </time>
        </article>
      ))}
    </section>
  )
}
