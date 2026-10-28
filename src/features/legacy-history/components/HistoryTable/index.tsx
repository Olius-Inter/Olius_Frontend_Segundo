import type { HistoryTableProps } from '../../types/history'
import HistoryRow from '../HistoryRow'
import styles from './styles.module.css'

export default function HistoryTable({ records }: HistoryTableProps) {
  return (
    <div
      className={styles.scroll}
      tabIndex={0}
      role="region"
      aria-label="Registros de coleta; role horizontalmente em telas pequenas"
    >
      <table className={styles.table}>
        <caption>Registros do período selecionado</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Volume</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <HistoryRow key={record.id} record={record} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
