import type { HistoryPaginationProps } from '../../types/history'
import styles from './styles.module.css'

export default function HistoryPagination({
  page,
  totalPages,
  total,
  onChange,
}: HistoryPaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginação do histórico">
      <p role="status">
        {total} registros · Página {page} de {Math.max(1, totalPages)}
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
