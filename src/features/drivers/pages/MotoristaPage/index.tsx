import { AdminResourceList } from '../../../admin-records'
import styles from './styles.module.css'
export default function MotoristaPage() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Motorista</h1>
        <p>Cadastros e acompanhamento dos motoristas da operação.</p>
      </header>
      <AdminResourceList resource="drivers" />
    </div>
  )
}
