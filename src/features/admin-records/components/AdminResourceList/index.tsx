import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import AdminRecordDialog from '../AdminRecordDialog'
import type { AdminResourceListProps } from '../../types/admin'
import { adminResources } from '../../data/adminResources'
import { useAdminRecords } from '../../hooks/useAdminRecords'
import AdminFilters from '../AdminFilters'
import AdminTable from '../AdminTable'
import AdminPagination from '../AdminPagination'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import styles from './styles.module.css'

export default function AdminResourceList({ resource }: AdminResourceListProps) {
  const config = adminResources[resource]
  const { filters, change, state, reload } = useAdminRecords(resource)
  const location = useLocation()
  const [search, setSearch] = useSearchParams()
  const [notice, setNotice] = useState('')
  const listRef = useRef<HTMLElement>(null)
  const focusPending = useRef(false)
  const selected = search.get('registro')
  const open = (id: string) => {
    const next = new URLSearchParams(search)
    next.set('registro', id)
    setSearch(next)
  }
  const close = () => {
    const next = new URLSearchParams(search)
    next.delete('registro')
    setSearch(next, { replace: true })
  }
  const saved = () => {
    close()
    focusPending.current = true
    setNotice('Registro atualizado.')
    reload()
  }
  useEffect(() => {
    if (focusPending.current && state.phase !== 'loading') {
      listRef.current?.focus()
      focusPending.current = false
    }
  }, [state.phase])
  const navigationNotice: unknown = location.state?.notice
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  return (
    <section className={styles.list} ref={listRef} tabIndex={-1} aria-label={config.title}>
      {notice && <p role="status">{notice}</p>}
      {typeof navigationNotice === 'string' && <p role="status">{navigationNotice}</p>}
      <header>
        <h2>{config.title}</h2>
        <p>{config.description}</p>
        {resource === 'drivers' && (
          <Link
            to="/motoristas/novo"
            state={{ returnTo: `${location.pathname}${location.search}` }}
          >
            Cadastrar motorista
          </Link>
        )}
      </header>
      <AdminFilters value={filters} statuses={config.statuses} onChange={change} />
      <div aria-busy={state.phase === 'loading'}>
        {state.phase === 'loading' && (
          <PageFeedback
            kind="loading"
            title="Carregando registros"
            description="Consultando os dados administrativos."
          />
        )}
        {state.phase === 'error' && (
          <PageFeedback
            kind="error"
            title="Não foi possível carregar a consulta"
            description={state.message}
          >
            <button type="button" onClick={reload}>
              Tentar novamente
            </button>
            {filters.page > 1 && (
              <button type="button" onClick={() => change({ page: 1 })}>
                Voltar à primeira página
              </button>
            )}
          </PageFeedback>
        )}
        {result?.kind === 'unavailable' && (
          <PageFeedback kind="empty" title="Integração pendente" description={result.message} />
        )}
        {data &&
          (data.items.length ? (
            <>
              <AdminTable config={config} records={data.items} onView={open} />
              <AdminPagination data={data} onChange={(page) => change({ page })} />
            </>
          ) : (
            <PageFeedback
              kind="empty"
              title="Nenhum resultado"
              description="Nenhum registro foi retornado para os filtros selecionados."
            />
          ))}
      </div>
      {selected && (
        <AdminRecordDialog
          key={`${resource}:${selected}`}
          resource={resource}
          id={selected}
          filters={filters}
          onClose={close}
          onSaved={saved}
        />
      )}
    </section>
  )
}
