import styles from '../../../styles/components/DriverStatusBadge/styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import type { DriverStatusBadgeProps } from '../../types/drivers/driverList'

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
