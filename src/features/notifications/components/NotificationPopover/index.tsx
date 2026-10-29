import { Bell, CheckCheck, RefreshCw, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotificationCenter } from '../../providers'
import { useNotificationPopover } from '../../hooks/useNotificationPopover'
import NotificationCard from '../NotificationCard'
import styles from './styles.module.css'

export default function NotificationPopover() {
  const { state, query, change, feedback, act, reload, canRead } = useNotificationCenter()
  const { id, trigger, panel, open, setOpen, position } = useNotificationPopover()
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  const unread = data?.unreadTotal ?? 0

  return (
    <>
      <button
        ref={trigger}
        className={styles.trigger}
        type="button"
        popoverTarget={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        aria-label={unread ? 'Notificações, ' + unread + ' não lidas' : 'Notificações'}
      >
        <Bell size={21} aria-hidden="true" />
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
      </button>
      <div
        ref={panel}
        id={id}
        popover="auto"
        role="dialog"
        aria-labelledby={id + '-title'}
        className={styles.panel}
        style={position}
        onToggle={(event) => {
          const nextOpen = event.newState === 'open'
          setOpen(nextOpen)
          if (nextOpen && (query.category !== 'ALL' || query.page !== 1))
            change({ category: 'ALL', page: 1 })
        }}
      >
        <header className={styles.header}>
          <h2 id={id + '-title'}>Notificações</h2>
          <button
            className={styles.markAll}
            type="button"
            disabled={feedback.busy || !canRead || !unread}
            onClick={() => {
              void act('read')
            }}
          >
            <CheckCheck size={16} aria-hidden="true" />
            Marcar todas como lidas
          </button>
          <button
            className={styles.iconButton}
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            aria-label="Fechar notificações"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.filters}>
          <div className={styles.tabs} role="group" aria-label="Leitura das notificações">
            <button
              type="button"
              aria-pressed={!query.unreadOnly}
              onClick={() => change({ category: 'ALL', unreadOnly: false })}
            >
              Todas
            </button>
            <button
              type="button"
              aria-pressed={query.unreadOnly}
              onClick={() => change({ category: 'ALL', unreadOnly: true })}
            >
              Não lidas {data && <span>{unread}</span>}
            </button>
          </div>
          <button
            className={styles.iconButton}
            type="button"
            onClick={reload}
            disabled={state.phase === 'loading'}
            aria-label="Atualizar notificações"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.body} aria-busy={state.phase === 'loading'}>
          {feedback.message && (
            <p className={styles.feedback} role="status">
              {feedback.message}
            </p>
          )}
          {state.phase === 'loading' && (
            <p className={styles.message} role="status">
              Carregando notificações…
            </p>
          )}
          {state.phase === 'error' && (
            <div className={styles.message} role="alert">
              <p>{state.message}</p>
              <button type="button" onClick={reload}>
                Tentar novamente
              </button>
            </div>
          )}
          {result?.kind === 'unavailable' && <p className={styles.message}>{result.message}</p>}
          {data &&
            (data.items.length ? (
              <div aria-label="Avisos da operação">
                {data.items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    compact
                    busy={feedback.busy}
                    canRead={canRead}
                    onRead={(notificationId) => {
                      void act('read', notificationId)
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.message}>
                Tudo em dia! Nenhuma notificação para os filtros selecionados.
              </p>
            ))}
        </div>
        <footer className={styles.footer}>
          {data && data.totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Paginação de notificações">
              <button
                type="button"
                disabled={query.page <= 1 || feedback.busy}
                onClick={() => change({ page: query.page - 1 })}
              >
                Anterior
              </button>
              <span>
                {query.page} de {data.totalPages}
              </span>
              <button
                type="button"
                disabled={query.page >= data.totalPages || feedback.busy}
                onClick={() => change({ page: query.page + 1 })}
              >
                Próxima
              </button>
            </nav>
          )}
          <Link to="/notificacoes">Ver todas as notificações</Link>
        </footer>
      </div>
    </>
  )
}
