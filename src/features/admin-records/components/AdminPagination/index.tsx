import type { AdminPaginationProps } from '../../types/admin'
import styles from './styles.module.css'

export default function AdminPagination({ data, onChange }: AdminPaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <p role="status">
        {data.total} registros · Página {data.page} de {Math.max(1, data.totalPages)}
      </p>
      <div>
        <button type="button" disabled={data.page <= 1} onClick={() => onChange(data.page - 1)}>
          Anterior
        </button>
        <button
          type="button"
          disabled={data.page >= data.totalPages}
          onClick={() => onChange(data.page + 1)}
        >
          Próxima
        </button>
      </div>
    </nav>
  )
}
