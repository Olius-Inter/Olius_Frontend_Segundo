import { Link } from 'react-router-dom'
import type { InvitationStatus, InvitationTableProps } from '../../types/adminInvitation'
import { getLocalInvitationPath } from '../../api/adminInvitationService'
import styles from './styles.module.css'

const labels: Record<InvitationStatus, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceito',
  EXPIRED: 'Expirado',
  REVOKED: 'Revogado',
}
export default function AdminInvitationTable({
  items,
  busy,
  canResend,
  canRevoke,
  onAction,
}: InvitationTableProps) {
  return (
    <div
      className={styles.scroll}
      role="region"
      aria-label="Lista de convites: tabela com rolagem horizontal"
      tabIndex={0}
    >
      <table>
        <caption>Convites de administradores</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
            <th scope="col">Situação</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const localPath = getLocalInvitationPath(item.id)
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  <span className={styles.status}>{labels[item.status]}</span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {item.allowedActions.includes('RESEND') && canResend && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction(item, 'RESEND')}
                        aria-label={`Reenviar convite para ${item.name}`}
                      >
                        Reenviar
                      </button>
                    )}
                    {item.allowedActions.includes('REVOKE') && canRevoke && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction(item, 'REVOKE')}
                        aria-haspopup="dialog"
                        aria-label={`Revogar convite de ${item.name}`}
                      >
                        Revogar
                      </button>
                    )}
                    {localPath && <Link to={localPath}>Abrir aceite</Link>}
                    {!item.allowedActions.length && <span>—</span>}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
