import styles from './styles.module.css'
import { Plus, Truck } from 'lucide-react'
import type { B2BHomeHeaderProps } from '../../types/b2bHome'

export default function B2BHomeHeader({
  data,
  registerEnabled,
  requestEnabled,
  onOperation,
}: B2BHomeHeaderProps) {
  return (
    <header className={styles['b2b-home-header']}>
      <div>
        <p className="eyebrow">PORTAL B2B</p>
        <h1>{data ? `Olá, ${data.user.name.trim().split(/\s+/)[0]}!` : 'Seu início no Olius'}</h1>
        <p className="lead">
          {data ? data.establishment.name : 'Uma visão rápida do seu estabelecimento.'}
        </p>
      </div>
      <div className={styles['b2b-quick-actions']} aria-label="Ações do estabelecimento">
        <button
          type="button"
          className={['button', styles['b2b-register-button']].join(' ')}
          disabled={!registerEnabled}
          onClick={() => onOperation('register')}
          aria-haspopup="dialog"
          aria-controls="b2b-operation-dialog"
        >
          <Plus size={18} aria-hidden="true" />
          Registrar óleo
        </button>
        <button
          type="button"
          className={['button', styles['b2b-request-button']].join(' ')}
          disabled={!requestEnabled}
          onClick={() => onOperation('request')}
          aria-haspopup="dialog"
          aria-controls="b2b-operation-dialog"
        >
          <Truck size={18} aria-hidden="true" />
          Solicitar coleta
        </button>
      </div>
    </header>
  )
}
