import type { RankingPaginationProps } from '../../types/ranking'
import styles from './styles.module.css'

export default function RankingPagination({
  page,
  totalPages,
  total,
  onChange,
}: RankingPaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginação do ranking">
      <p role="status">
        {total} estabelecimentos · Página {page} de {Math.max(1, totalPages)}
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
