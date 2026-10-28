import styles from './styles.module.css'
import { useDrivers } from '../../hooks/useDrivers'
import type { DriverSort, DriverStatusFilter } from '../../types/driverList'

export default function DriverFilters() {
  const { filters, setFilters, resetFilters, storageAvailable } = useDrivers()
  return (
    <section
      className={['card', styles['driver-filters']].join(' ')}
      aria-label="Filtros de motoristas"
    >
      <div className={styles['driver-filter-field']}>
        <label htmlFor="driver-search">Buscar por nome</label>
        <input
          id="driver-search"
          type="search"
          maxLength={120}
          autoComplete="off"
          value={filters.name}
          placeholder="Nome do motorista"
          onChange={(event) => setFilters({ name: event.target.value })}
        />
      </div>
      <div className={styles['driver-filter-field']}>
        <label htmlFor="driver-status-filter">Status</label>
        <select
          id="driver-status-filter"
          value={filters.status}
          onChange={(event) => setFilters({ status: event.target.value as DriverStatusFilter })}
        >
          <option value="ALL">Todos</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </select>
      </div>
      <div className={styles['driver-filter-field']}>
        <label htmlFor="driver-sort">Ordenar por nome</label>
        <select
          id="driver-sort"
          value={filters.sort}
          onChange={(event) => setFilters({ sort: event.target.value as DriverSort })}
        >
          <option value="name-asc">A → Z</option>
          <option value="name-desc">Z → A</option>
        </select>
      </div>
      <button
        className={['button', styles['driver-filter-reset']].join(' ')}
        type="button"
        onClick={resetFilters}
      >
        Limpar filtros
      </button>
      {!storageAvailable && (
        <p className={styles['driver-storage-notice']} role="status">
          As preferências serão mantidas somente enquanto esta página estiver aberta.
        </p>
      )}
    </section>
  )
}
