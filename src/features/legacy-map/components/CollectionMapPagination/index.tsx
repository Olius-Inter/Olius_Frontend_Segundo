import type { CollectionMapPaginationProps } from '../../types/collectionMap'
import styles from './styles.module.css'

export default function CollectionMapPagination({
  page,
  totalPages,
  total,
  onChange,
}: CollectionMapPaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginação dos pontos de coleta">
      <p role="status">
        {total} pontos · Página {page} de {Math.max(1, totalPages)}
      </p>
      <div>
        <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Próxima
        </button>
      </div>
    </nav>
  )
}
