import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CollectorInvitationProps } from '../../types/collectionMap'
import { collectorEnabled } from '../../utils/collectionMapRules'
import styles from './styles.module.css'

export default function CollectorInvitation({ collector }: CollectorInvitationProps) {
  if (collectorEnabled(collector)) return null
  if (collector?.status === 'PENDING')
    return (
      <aside className={styles.notice} role="status">
        <CircleAlert aria-hidden="true" />
        <div>
          <h2>Cadastro de ponto em análise</h2>
          <p>
            As funções de coleta serão disponibilizadas conforme a aprovação e as permissões da sua
            conta.
          </p>
        </div>
      </aside>
    )
  return (
    <aside className={styles.notice}>
      <CircleAlert aria-hidden="true" />
      <div>
        <h2>Vire um ponto de Coleta</h2>
        <p>Receba óleo no seu ponto de coleta e divulgue sua empresa.</p>
        {(!collector || collector.canApply) && <Link to="/mapa/virar-coletor">Vire Coletor</Link>}
        {collector && !collector.canApply && <p>Consulte o Olius para regularizar seu cadastro.</p>}
      </div>
    </aside>
  )
}
