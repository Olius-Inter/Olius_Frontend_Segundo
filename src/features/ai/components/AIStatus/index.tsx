import type { AIStatusProps } from '../../types/ai'
import styles from './styles.module.css'

export default function AIStatus({ configured, error }: AIStatusProps) {
  return (
    <div>
      {!configured && (
        <p className={styles.notice} role="status">
          Integração em preparação. Você pode explorar os temas e escrever sua pergunta; o envio
          estará disponível quando a IA for conectada.
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
