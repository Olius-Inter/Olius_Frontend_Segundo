import styles from './styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import type { DriverStatusBadgeProps } from '../../types/driverList'

const classStyles = { ...styles }

export default function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  return (
    <span
      className={mapClassNames(
        `status-chip ${status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`,
        classStyles,
      )}
    >
      {status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
    </span>
  )
}
