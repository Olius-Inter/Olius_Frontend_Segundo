import { useAdminInvitations } from '../../hooks/useAdminInvitations'
import Modal from '../../../../shared/ui/Modal'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import AdminInvitationForm from '../AdminInvitationForm'
import AdminInvitationTable from '../AdminInvitationTable'
import styles from './styles.module.css'

export default function AdminInvitations() {
  const {
    state,
    reload,
    page,
    setPage,
    open,
    show,
    close,
    revoking,
    values,
    setValues,
    feedback,
    send,
    perform,
    revoke,
    canCreate,
    canResend,
    canRevoke,
  } = useAdminInvitations()
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  return (
    <section className={styles.section}>
      <header className={styles.heading}>
        <div>
          <h2>Convites de administradores</h2>
          <p>Convide pessoas para administrar a operação.</p>
        </div>
        <div>
          <button type="button" onClick={reload} disabled={feedback.busy}>
            Atualizar convites
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={show}
            disabled={feedback.busy}
            aria-haspopup="dialog"
          >
            Convidar administrador
          </button>
        </div>
      </header>
      {feedback.notice && <p role="status">{feedback.notice}</p>}
      {feedback.error && !open && !revoking && <p role="alert">{feedback.error}</p>}
      {state.phase === 'loading' && <p role="status">Carregando convites…</p>}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível consultar os convites"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {result?.kind === 'unavailable' && (
        <PageFeedback
          kind="empty"
          title="Convites aguardando integração"
          description={result.message}
        />
      )}
      {data &&
        (data.items.length ? (
          <>
            <AdminInvitationTable
              items={data.items}
              busy={feedback.busy}
              canResend={canResend}
              canRevoke={canRevoke}
              onAction={(item, action) => {
                void perform(item, action)
              }}
            />
            <nav className={styles.pagination} aria-label="Paginação de convites">
              <span>
                {data.total} convites · Página {page} de {Math.max(1, data.totalPages)}
              </span>
              <button
                disabled={feedback.busy || page <= 1}
                type="button"
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <button
                disabled={feedback.busy || page >= data.totalPages}
                type="button"
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </nav>
          </>
        ) : (
          <div>
            <p>Nenhum convite encontrado.</p>
            {page > 1 && (
              <button type="button" onClick={() => setPage(1)}>
                Voltar à primeira página
              </button>
            )}
          </div>
        ))}
      <Modal open={open} title="Convidar administrador" busy={feedback.busy} onClose={close}>
        <AdminInvitationForm
          values={values}
          onChange={setValues}
          onSubmit={() => {
            void send()
          }}
          busy={feedback.busy}
          available={canCreate}
          error={feedback.error}
        />
      </Modal>
      <Modal open={Boolean(revoking)} title="Revogar convite" busy={feedback.busy} onClose={close}>
        {revoking && (
          <div className={styles.revoke}>
            <p>
              Revogar o convite de <strong>{revoking.name}</strong> ({revoking.email})? O link
              deixará de permitir o aceite.
            </p>
            {feedback.error && <p role="alert">{feedback.error}</p>}
            <button
              type="button"
              disabled={feedback.busy}
              onClick={() => {
                void revoke()
              }}
            >
              {feedback.busy ? 'Revogando…' : 'Revogar convite'}
            </button>
          </div>
        )}
      </Modal>
    </section>
  )
}
