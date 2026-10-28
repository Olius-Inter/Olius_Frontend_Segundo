import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { AdminRecordDialogProps } from '../../types/admin'
import { useAdminDetail } from '../../hooks/useAdminDetail'
import { formatAdminValue } from '../../lib/adminFormatting'
import AdminActionForm from '../AdminActionForm'
import CollectionRequestActions from '../CollectionRequestActions'
import CollectionRequestContact from '../CollectionRequestContact'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import Modal from '../../../../shared/ui/Modal'
import styles from './styles.module.css'

export default function AdminRecordDialog({
  resource,
  id,
  filters,
  onClose,
  onSaved,
}: AdminRecordDialogProps) {
  const { state, reload } = useAdminDetail(resource, id, filters)
  const [busy, setBusy] = useState(false)
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.delete('registro')
  const returnTo = `${location.pathname}${params.size ? `?${params}` : ''}`
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  const isRequest = resource === 'requests' || resource === 'agenda'
  const ActionForm = isRequest ? CollectionRequestActions : AdminActionForm
  return (
    <Modal open title={data?.title ?? 'Detalhes do registro'} busy={busy} onClose={onClose}>
      <div className={styles.content}>
        {state.phase === 'loading' && (
          <PageFeedback
            kind="loading"
            title="Carregando detalhes"
            description="Consultando o registro selecionado."
          />
        )}
        {state.phase === 'error' && (
          <PageFeedback
            kind="error"
            title="Não foi possível consultar o registro"
            description={state.message}
          >
            <button type="button" onClick={reload}>
              Tentar novamente
            </button>
          </PageFeedback>
        )}
        {result?.kind === 'unavailable' && (
          <PageFeedback kind="empty" title="Integração pendente" description={result.message} />
        )}
        {data && (
          <>
            {resource === 'drivers' && (
              <Link className={styles.edit} to={`/motoristas/${id}/editar`} state={{ returnTo }}>
                Editar motorista
              </Link>
            )}
            {isRequest && <CollectionRequestContact request={data.request} />}
            {data.sections
              .map((section) =>
                isRequest
                  ? {
                      ...section,
                      fields: section.fields.filter(
                        (field) => field.format !== 'status' && field.label !== 'Situação',
                      ),
                    }
                  : section,
              )
              .filter((section) => section.fields.length > 0)
              .map((section) => (
                <section key={section.title} className={styles.section}>
                  <h3>{section.title}</h3>
                  <dl>
                    {section.fields.map((field) => (
                      <div key={field.label}>
                        <dt>{field.label}</dt>
                        <dd>{formatAdminValue(field.value, field.format)}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            {!isRequest && data.history.length > 0 && (
              <section className={styles.section}>
                <h3>Histórico e autoria</h3>
                <ol className={styles.history}>
                  {data.history.map((event) => (
                    <li key={event.id}>
                      <time dateTime={event.date}>{formatAdminValue(event.date, 'date')}</time> ·{' '}
                      {event.author}
                      <p>{event.description}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <ActionForm
              key={`${data.id}:${data.revision}:${data.actions.join(',')}`}
              resource={resource}
              detail={data}
              onSaved={onSaved}
              onRefresh={reload}
              onBusyChange={setBusy}
            />
          </>
        )}
      </div>
    </Modal>
  )
}
