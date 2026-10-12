import { Clock, MapPin, UserRound } from 'lucide-react'
import type { CollectionPointCardProps } from '../../types/collectionMap'
import { pointRoute } from '../../utils/collectionMapRules'
import styles from './styles.module.css'

export default function CollectionPointCard({
  point,
  selected,
  onSelect,
}: CollectionPointCardProps) {
  const Icon = point.marker === 'PERSON' ? UserRound : MapPin
  return (
    <article className={`${styles.card} ${selected ? styles.selected : ''}`}>
      <div className={`${styles.icon} ${point.marker === 'PERSON' ? styles.person : ''}`}>
        <Icon size={32} aria-hidden="true" />
      </div>
      <div className={styles.details}>
        <h3>{point.name}</h3>
        <p>{point.address}</p>
        <p className={styles.schedule}>
          <Clock size={15} aria-hidden="true" />
          {point.scheduleLabel ?? 'Horários indisponíveis'}
        </p>
        <p>
          {point.openNow === null
            ? 'Funcionamento a confirmar'
            : point.openNow
              ? 'Aberto agora'
              : 'Fechado agora'}
          {point.distanceMeters !== null &&
            ` · ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(point.distanceMeters / 1000)} km`}
        </p>
        {point.sponsored && <span className={styles.label}>Patrocinado</span>}
        {point.seal && (
          <span className={styles.label}>
            Selo {{ BRONZE: 'Bronze', SILVER: 'Prata', GOLD: 'Ouro' }[point.seal]}
          </span>
        )}
        <div className={styles.actions}>
          <button type="button" aria-pressed={selected} onClick={() => onSelect(point.id)}>
            Ver no mapa<span className={styles.srOnly}>: {point.name}</span>
          </button>
          <a href={pointRoute(point.coordinates)} target="_blank" rel="noopener noreferrer">
            Como chegar<span className={styles.srOnly}> a {point.name} (abre Google Maps)</span>
          </a>
        </div>
      </div>
    </article>
  )
}
