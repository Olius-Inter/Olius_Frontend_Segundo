import type { AdminAccountsProps } from '../../../auth/contracts'
import { useAdminAccounts } from '../../hooks/useAdminAccounts'
import { AdminInvitations } from '../../../invitations'
import Modal from '../../../../shared/ui/Modal'
import styles from './styles.module.css'

export default function AdminAccounts({ allowInvite = true, expectedType }: AdminAccountsProps) {
  const { lookup, setLookup, users, user, close, feedback, consult, toggleStatus } =
    useAdminAccounts(expectedType)
  return (
    <div className={styles.accounts}>
      {allowInvite && <AdminInvitations />}
      <header className={styles.heading}>
        <div>
          <h2>Contas administrativas</h2>
          <p>Consulte uma conta pelo identificador para acompanhar seus dados.</p>
        </div>
      </header>
      <form
        className={styles.lookup}
        onSubmit={(event) => {
          event.preventDefault()
          void consult()
        }}
      >
        <label>
          Identificador da conta (UUID)
          <input
            required
            maxLength={36}
            disabled={feedback.busy}
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
          />
        </label>
        <button type="submit" disabled={feedback.busy}>
          {feedback.busy ? 'Consultando…' : 'Consultar conta'}
        </button>
      </form>
      {feedback.error && !user && <p role="alert">{feedback.error}</p>}
      {feedback.success && !user && <p role="status">{feedback.success}</p>}
      <div
        className={styles.scroll}
        role="region"
        aria-label="Contas consultadas: tabela com rolagem horizontal"
        tabIndex={0}
      >
        <table>
          <caption>Contas consultadas nesta sessão</caption>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Situação</th>
              <th scope="col">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}</td>
                <td>
                  <button
                    type="button"
                    disabled={feedback.busy}
                    aria-haspopup="dialog"
                    onClick={() => {
                      void consult(item.id)
                    }}
                  >
                    Visualizar {item.name}
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4}>Consulte uma conta para adicioná-la a esta tabela.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(user)}
        title={user?.name ?? 'Detalhes da conta'}
        busy={feedback.busy}
        onClose={close}
      >
        {user && (
          <div className={styles.details}>
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{user.userType}</dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>{user.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}</dd>
              </div>
            </dl>
            <button
              type="button"
              disabled={feedback.busy}
              onClick={() => {
                void toggleStatus()
              }}
            >
              {user.status === 'ACTIVE' ? 'Inativar conta' : 'Reativar conta'}
            </button>
            {feedback.error && <p role="alert">{feedback.error}</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
