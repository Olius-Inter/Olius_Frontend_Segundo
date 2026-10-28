import type { CollectionPointListProps } from '../../types/collectionMap'
import CollectionPointCard from '../CollectionPointCard'
import styles from './styles.module.css'

export default function CollectionPointList({
  points,
  selectedId,
  onSelect,
}: CollectionPointListProps) {
  return (
    <section className={styles.list} aria-labelledby="collection-point-list">
      <h2 id="collection-point-list">Pontos de Coleta próximos</h2>
      {points.map((point) => (
        <CollectionPointCard
          key={point.id}
          point={point}
          selected={selectedId === point.id}
          onSelect={onSelect}
        />
      ))}
    </section>
  )
}
