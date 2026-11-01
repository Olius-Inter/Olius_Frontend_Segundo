import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import AdminTabs from '../../components/AdminTabs'
import AdminResourceList from '../../components/AdminResourceList'
import AdminAccounts from '../../components/AdminAccounts'
import { adminTabs } from '../../data/admin-records/adminResources'
import { resolveAdminArea, resolveAdminResource } from '../../utils/admin-records/adminNavigation'
import NotFoundPage from '../NotFoundPage'
import styles from '../../../styles/pages/AdminAreaPage/styles.module.css'

const names = {
  operacao: 'Operação',
  cadastros: 'Cadastros',
  comercial: 'Comercial',
  resultados: 'Resultados',
  administracao: 'Administração',
}
export default function AdminAreaPage() {
  const { area: rawArea, tab } = useParams()
  const [search] = useSearchParams()
  const area = resolveAdminArea(rawArea)
  if (!area) return <NotFoundPage />
  if (!tab) return <Navigate to={`/${area}/${adminTabs[area][0].slug}`} replace />
  if (
    area === 'operacao' &&
    tab === 'historico' &&
    search.get('tipo') &&
    search.get('tipo') !== 'rejeitadas'
  )
    return <Navigate to="/operacao/historico" replace />
  const resource = resolveAdminResource(area, tab, search)
  if (!resource) return <NotFoundPage />
  return (
    <div className={styles.area}>
      <h1>{names[area]}</h1>
      <AdminTabs area={area} />
      {area === 'operacao' && tab === 'historico' && (
        <nav aria-label="Tipo de histórico" className={styles.subnav}>
          <Link
            aria-current={resource === 'collections' ? 'page' : undefined}
            to="/operacao/historico"
          >
            Coletas B2B
          </Link>
          <Link
            aria-current={resource === 'requests' ? 'page' : undefined}
            to="/operacao/historico?tipo=rejeitadas"
          >
            Solicitações rejeitadas
          </Link>
        </nav>
      )}
      {area === 'comercial' && tab === 'financeiro' && (
        <nav aria-label="Consultas financeiras" className={styles.subnav}>
          <Link to="/comercial/financeiro">Cobranças</Link>
          <Link to="/comercial/financeiro?tipo=pagamentos">Pagamentos</Link>
          <Link to="/comercial/financeiro?tipo=reembolsos">Reembolsos</Link>
        </nav>
      )}
      {resource === 'admins' ? (
        <AdminAccounts />
      ) : (
        <>
          {resource === 'establishments' && (
            <AdminAccounts key={resource} allowInvite={false} expectedType="ESTABLISHMENT" />
          )}
          <AdminResourceList key={resource} resource={resource} />
        </>
      )}
    </div>
  )
}
