import type { HistoryStatusBadgeProps } from '../../types/legacy-history/history'
import { historyLabels, historyVisualStatus } from '../../utils/legacy-history/historyRules'
import styles from '../../../styles/components/HistoryStatusBadge/styles.module.css'

export default function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
  const visual = historyVisualStatus(status)
  return <span className={`${styles.badge} ${styles[visual]}`}>{historyLabels[visual]}</span>
}
