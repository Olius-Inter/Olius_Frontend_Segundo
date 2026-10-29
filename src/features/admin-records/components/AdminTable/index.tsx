import type { AdminTableProps } from '../../types/admin'
import { formatAdminValue } from '../../lib/adminFormatting'
import styles from './styles.module.css'

export default function AdminTable({ config, records, onView }: AdminTableProps) {
  return (
    <div
      className={styles.scroll}
      role="region"
      tabIndex={0}
      aria-label={`${config.title}: tabela com rolagem horizontal`}
    >
      <table>
        <caption>{config.title} · registros da página atual</caption>
        <thead>
          <tr>
            {config.columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            <th scope="col">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {config.columns.map((column) => (
                <td key={column.key}>
                  {formatAdminValue(record.cells[column.key], column.format)}
                </td>
              ))}
              <td>
                <button type="button" aria-haspopup="dialog" onClick={() => onView(record.id)}>
                  Abrir<span className={styles.srOnly}>: {record.title}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
