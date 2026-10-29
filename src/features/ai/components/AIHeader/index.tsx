import { Sparkles } from 'lucide-react'
import styles from './styles.module.css'

export default function AIHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.icon}>
        <Sparkles size={30} aria-hidden="true" />
      </span>
      <div>
        <p>ASSISTENTE OLIUS</p>
        <h1>IA para o seu estabelecimento</h1>
        <p>Tire dúvidas sobre descarte de óleo, coletas e o uso do Olius.</p>
      </div>
    </header>
  )
}
