import { useId, useEffect, useState } from 'react'
import type { AdminFiltersProps } from '../../types/admin-records/admin'
import { validateAdminFilters } from '../../utils/admin-records/adminValidation'
import { adminStatusLabels } from '../../utils/admin-records/adminFormatting'
import styles from '../../../styles/components/AdminFilters/styles.module.css'

export default function AdminFilters({ value, statuses, onChange, hideSearch }: AdminFiltersProps) {
  const fieldId = useId()

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
        <label htmlFor={`${fieldId}-field-1`}>
          Buscar
          <input
            id={`${fieldId}-field-1`}
            value={draft.search}
            maxLength={150}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, search: event.target.value }))
            }
          />
        </label>
      )}
      {statuses.length > 0 && (
        <label htmlFor={`${fieldId}-field-2`}>
          Situação
          <select
            id={`${fieldId}-field-2`}
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
        <label htmlFor={`${fieldId}-field-3`}>
          De
          <input
            id={`${fieldId}-field-3`}
            type="date"
            value={draft.from}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, from: event.target.value }))
            }
          />
        </label>
        <label htmlFor={`${fieldId}-field-4`}>
          Até
          <input
            id={`${fieldId}-field-4`}
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
