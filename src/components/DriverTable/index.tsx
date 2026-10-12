import styles from './styles.module.css'
import type { DriverTableProps } from '../../types/driverList'
import DriverRow from '../DriverRow'

export default function DriverTable({ drivers }: DriverTableProps) {
  return (
    <section className={['card', styles['table-card']].join(' ')} aria-label="Lista de motoristas">
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabela de motoristas; role horizontalmente em telas menores"
      >
        <table>
          <caption className="sr-only">
            Motoristas encontrados: nome, CPF e CNH mascarados, status e ação de edição.
          </caption>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">CPF</th>
              <th scope="col">CNH</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <DriverRow key={driver.id} driver={driver} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
