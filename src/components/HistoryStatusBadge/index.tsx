import type { HistoryStatusBadgeProps } from '../../types/history'
import { historyLabels, historyVisualStatus } from '../../utils/historyRules'
import styles from './styles.module.css'

export default function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
  const visual = historyVisualStatus(status)
  return <span className={`${styles.badge} ${styles[visual]}`}>{historyLabels[visual]}</span>
}
