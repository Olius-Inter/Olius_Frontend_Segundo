import type { CollectionMapFiltersProps, MapQuery } from '../../types/collectionMap'
import styles from './styles.module.css'

export default function CollectionMapFilters({
  query,
  search,
  locating,
  onSearch,
  onSubmit,
  onChange,
  onLocate,
}: CollectionMapFiltersProps) {
  return (
    <div className={styles.filters}>
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <label htmlFor="map-search">Buscar endereço ou ponto de coleta</label>
        <div>
          <input
            id="map-search"
            value={search}
            maxLength={120}
            placeholder="Rua, bairro, cidade ou nome do ponto"
            onChange={(event) => onSearch(event.target.value)}
          />
          <button type="submit">Buscar</button>
        </div>
      </form>
      <div className={styles.controls}>
        <button type="button" onClick={onLocate} disabled={locating}>
          {locating ? 'Localizando…' : 'Usar minha localização'}
        </button>
        <label>
          Distância
          <select
            value={query.radiusKm}
            onChange={(event) => onChange({ radiusKm: Number(event.target.value) })}
          >
            {[5, 10, 25, 50].map((radius) => (
              <option key={radius} value={radius}>
                Até {radius} km
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo de ponto
          <select
            value={query.type}
            onChange={(event) => onChange({ type: event.target.value as MapQuery['type'] })}
          >
            <option value="ALL">Todos</option>
            <option value="PEV">PEV</option>
            <option value="ESTABLISHMENT">Estabelecimento</option>
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={query.openNow}
            onChange={(event) => onChange({ openNow: event.target.checked })}
          />
          Aberto agora
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={query.withSeal}
            onChange={(event) => onChange({ withSeal: event.target.checked })}
          />
          Com selo
        </label>
      </div>
    </div>
  )
}
