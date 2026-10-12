import styles from './styles.module.css'
import { Link } from 'react-router-dom'
import DriversProvider from '../../contexts/DriversContext'
import PageHeading from '../../components/PageHeading'
import DriverFilters from '../../components/DriverFilters'
import DriverListResults from '../../components/DriverListResults'

export default function DriversPage() {
  return (
    <DriversProvider>
      <PageHeading
        title="Motoristas"
        description="Lista de profissionais usados nas operações de coleta."
      />
      <div className={styles['drivers-toolbar']}>
        <Link className="button" to="/motoristas/novo">
          Cadastrar motorista
        </Link>
      </div>
      <DriverFilters />
      <DriverListResults />
    </DriversProvider>
  )
}
