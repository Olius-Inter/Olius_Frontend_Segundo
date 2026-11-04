import { usePevRequests } from '../../hooks/pev/usePevRequests'
import { MapPin } from 'lucide-react'
import type { PevRequestsProps } from '../../types/pev/pev'
import Modal from '../Modal'
import PageFeedback from '../PageFeedback'
import styles from '../../../styles/components/PevRequests/styles.module.css'

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

export default function PevRequests({ ownerType }: PevRequestsProps) {
  const {
    page,
    setPage,
    selection,
    setSelection,
    busy,
    error,
    notice,
    heading,
    available,
    localDemoEnabled,
    state,
    result,
    reload,
    select,
    confirm,
  } = usePevRequests(ownerType)

  return (
    <section className={styles.queue}>
      <h2 ref={heading} tabIndex={-1}>
        Credenciamento de PEVs
      </h2>
      <p className={styles.description}>
        Analise pedidos pendentes para virar ponto de entrega voluntária.
      </p>
      <div role="status">{notice}</div>
      {!available && (
        <PageFeedback
          kind="empty"
          title="Consulta à API indisponível"
          description={
            localDemoEnabled
              ? 'Saia do modo de demonstração e conecte a Core para consultar pedidos reais de PEV.'
              : 'Configure a conexão com a Core para consultar pedidos de PEV.'
          }
        />
      )}
      {available && state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando pedidos de PEV"
          description="Consultando a fila na Core."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível carregar a fila"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {result && (
        <>
          {result.items.length === 0 && (
            <PageFeedback
              kind="empty"
              title="Nenhum pedido pendente"
              description="Não há pedidos de PEV neste filtro e nesta página."
            />
          )}
          {result.items.map((request) => (
            <article key={request.id} className={styles.card}>
              <div className={styles.meta}>
                <time dateTime={request.createdAt}>
                  {dateFormat.format(new Date(request.createdAt))}
                </time>
                <span>
                  {request.ownerType === 'ESTABLISHMENT' ? 'B2B · Empresa' : 'B2C · Cidadão'}
                </span>
              </div>
              <h3>{request.ownerName}</h3>
              <p className={styles.address}>
                <MapPin size={17} aria-hidden="true" />
                <span>
                  {request.address.street}, {request.address.number}
                  {request.address.complement ? ' · ' + request.address.complement : ''} ·{' '}
                  {request.address.neighborhood} · {request.address.city}/{request.address.state} ·
                  CEP {request.address.cep}
                </span>
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.reject}
                  onClick={() => select(request, 'REJECTED')}
                >
                  Rejeitar
                </button>
                <button
                  type="button"
                  className={styles.approve}
                  onClick={() => select(request, 'APPROVED')}
                >
                  Aprovar
                </button>
              </div>
            </article>
          ))}
          {(page > 0 || result.totalElements > result.size) && (
            <nav className={styles.pagination} aria-label="Paginação dos pedidos de PEV">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span>
                Página {page + 1} · {result.totalElements} pedidos
              </span>
              <button
                type="button"
                disabled={(page + 1) * result.size >= result.totalElements}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
      {selection && (
        <Modal
          open
          title={
            selection.decision === 'APPROVED' ? 'Aprovar pedido de PEV' : 'Rejeitar pedido de PEV'
          }
          busy={busy}
          onClose={() => setSelection(null)}
        >
          <p>
            Confirme a decisão para o pedido de <strong>{selection.request.ownerName}</strong>.
          </p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" disabled={busy} onClick={() => setSelection(null)}>
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              className={selection.decision === 'APPROVED' ? styles.approve : styles.reject}
              onClick={() => void confirm()}
            >
              {busy ? 'Registrando…' : 'Confirmar decisão'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}
