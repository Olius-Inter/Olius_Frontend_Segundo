import styles from './styles.module.css'
import { Link } from 'react-router-dom'
import type { DriverRowProps } from '../../types/driverList'
import { maskCpf } from '../../utils/validateDriver'
import { maskCnh } from '../../utils/formatDriver'
import DriverStatusBadge from '../DriverStatusBadge'

export default function DriverRow({ driver }: DriverRowProps) {
  return (
    <tr>
      <td>{driver.name}</td>
      <td>{maskCpf(driver.cpf)}</td>
      <td>{maskCnh(driver.cnh)}</td>
      <td>
        <DriverStatusBadge status={driver.status} />
      </td>
      <td>
        <Link
          className={styles['driver-edit-link']}
          to={`/motoristas/${encodeURIComponent(driver.id)}/editar`}
          aria-label={`Editar motorista ${driver.name}`}
        >
          Editar
        </Link>
      </td>
    </tr>
  )
}
