import { useNotificationCenter } from '../../providers'
import { Bell, RefreshCw } from 'lucide-react'
import { useAuth } from '../../../auth'
import type { NotificationCategory } from '../../types/notifications'
import NotificationCard from '../../components/NotificationCard'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import styles from './styles.module.css'

const categories: { value: NotificationCategory; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'REQUESTS', label: 'Solicitações' },
  { value: 'AGENDA', label: 'Agenda' },
  { value: 'SYSTEM', label: 'Sistema' },
]
export default function NotificationsPage() {
  const notifications = useNotificationCenter()
  const { demo } = useAuth()
  const { state, query, change, feedback, act, reload, canRead, canClear } = notifications
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  return (
    <div className={styles.page}>
      <header>
        <div>
          <h1>Notificações</h1>
          <p>O que você precisa acompanhar na operação.</p>
        </div>
        <button type="button" onClick={reload}>
          <RefreshCw size={17} aria-hidden="true" />
          Atualizar
        </button>
      </header>
      <div className={styles.filters}>
        <div role="group" aria-label="Categoria de notificações">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              aria-pressed={query.category === category.value}
              onClick={() => change({ category: category.value })}
            >
              {category.label}
            </button>
          ))}
        </div>
        <label>
          <input
            type="checkbox"
            checked={query.unreadOnly}
            onChange={(e) => change({ unreadOnly: e.target.checked })}
          />
          Somente não lidas
        </label>
      </div>
      <div className={styles.tools}>
        <span>
          <Bell size={16} aria-hidden="true" />
          {data?.unreadTotal ?? '—'} não lidas
        </span>
        <div>
          <button
            type="button"
            disabled={feedback.busy || !canRead || !data?.unreadTotal}
            onClick={() => {
              void act('read')
            }}
          >
            Marcar todas como lidas
          </button>
          <button
            type="button"
            disabled={feedback.busy || !canClear}
            onClick={() => {
              void act('clear')
            }}
          >
            Limpar lidas
          </button>
          {demo && (
            <button
              type="button"
              disabled={feedback.busy}
              onClick={() => {
                void act('simulate')
              }}
            >
              Gerar aviso de teste
            </button>
          )}
        </div>
      </div>
      {feedback.message && <p role="status">{feedback.message}</p>}
      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando notificações"
          description="Consultando os avisos da sua conta."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível carregar os avisos"
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
          title="Notificações aguardando integração"
          description={result.message}
        />
      )}
      {data &&
        (data.items.length ? (
          <section className={styles.list} aria-label="Avisos da operação">
            {data.items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                busy={feedback.busy}
                canRead={canRead}
                onRead={(id) => {
                  void act('read', id)
                }}
              />
            ))}
          </section>
        ) : (
          <PageFeedback
            kind="empty"
            title="Tudo em dia"
            description="Nenhuma notificação para os filtros selecionados."
          />
        ))}
      {data && data.totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Paginação de notificações">
          <button
            type="button"
            disabled={query.page <= 1}
            onClick={() => change({ page: query.page - 1 })}
          >
            Anterior
          </button>
          <span>
            Página {query.page} de {data.totalPages}
          </span>
          <button
            type="button"
            disabled={query.page >= data.totalPages}
            onClick={() => change({ page: query.page + 1 })}
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  )
}
