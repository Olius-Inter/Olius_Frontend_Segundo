import { useEffect, useState } from 'react'
import type { AdminFiltersProps } from '../../types/admin'
import { validateAdminFilters } from '../../validation/adminValidation'
import { adminStatusLabels } from '../../lib/adminFormatting'
import styles from './styles.module.css'

export default function AdminFilters({ value, statuses, onChange, hideSearch }: AdminFiltersProps) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState('')
  useEffect(() => setDraft(value), [value])
  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault()
        if (!validateAdminFilters(draft)) {
          setError('Informe um período válido, com início anterior ao fim.')
          return
        }
        setError('')
        onChange({ ...draft, search: draft.search.trim().normalize('NFC'), page: 1 })
      }}
    >
      {!hideSearch && (
        <label>
          Buscar
          <input
            value={draft.search}
            maxLength={150}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, search: event.target.value }))
            }
          />
        </label>
      )}
      {statuses.length > 0 && (
        <label>
          Situação
          <select
            value={draft.status}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, status: event.target.value }))
            }
          >
            <option value="">Todas</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {adminStatusLabels[status] ?? status}
              </option>
            ))}
          </select>
        </label>
      )}
      <>
        <label>
          De
          <input
            type="date"
            value={draft.from}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, from: event.target.value }))
            }
          />
        </label>
        <label>
          Até
          <input
            type="date"
            value={draft.to}
            onChange={(event) => setDraft((previous) => ({ ...previous, to: event.target.value }))}
          />
        </label>
      </>
      <button type="submit">Aplicar filtros</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
