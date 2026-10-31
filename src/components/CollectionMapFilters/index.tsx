import { useId } from 'react'
import type { CollectionMapFiltersProps, MapQuery } from '../../types/legacy-map/collectionMap'
import styles from '../../../styles/components/CollectionMapFilters/styles.module.css'

export default function CollectionMapFilters({
  query,
  search,
  locating,
  onSearch,
  onSubmit,
  onChange,
  onLocate,
}: CollectionMapFiltersProps) {
  const fieldId = useId()

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
        <label htmlFor={`${fieldId}-field-1`}>
          Distância
          <select
            id={`${fieldId}-field-1`}
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
        <label htmlFor={`${fieldId}-field-2`}>
          Tipo de ponto
          <select
            id={`${fieldId}-field-2`}
            value={query.type}
            onChange={(event) => onChange({ type: event.target.value as MapQuery['type'] })}
          >
            <option value="ALL">Todos</option>
            <option value="PEV">PEV</option>
            <option value="ESTABLISHMENT">Estabelecimento</option>
          </select>
        </label>
        <label htmlFor={`${fieldId}-field-3`} className={styles.checkbox}>
          <input
            id={`${fieldId}-field-3`}
            type="checkbox"
            checked={query.openNow}
            onChange={(event) => onChange({ openNow: event.target.checked })}
          />
          Aberto agora
        </label>
        <label htmlFor={`${fieldId}-field-4`} className={styles.checkbox}>
          <input
            id={`${fieldId}-field-4`}
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
