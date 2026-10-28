import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import AdminTabs from '../../../../features/admin-records/components/AdminTabs'
import AdminResourceList from '../../../../features/admin-records/components/AdminResourceList'
import AdminAccounts from '../../../../features/accounts/components/AdminAccounts'
import { adminTabs } from '../../../../features/admin-records/data/adminResources'
import {
  resolveAdminArea,
  resolveAdminResource,
} from '../../../../features/admin-records/lib/adminNavigation'
import NotFoundPage from '../../../../shared/ui/NotFoundPage'
import styles from './styles.module.css'

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
            aria-current={resource === 'deliveries' ? 'page' : undefined}
            to="/operacao/historico?tipo=b2c"
          >
            Entregas B2C
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
          {(resource === 'citizens' || resource === 'establishments') && (
            <AdminAccounts
              key={resource}
              allowInvite={false}
              expectedType={resource === 'citizens' ? 'CITIZENS' : 'ESTABLISHMENT'}
            />
          )}
          <AdminResourceList key={resource} resource={resource} />
        </>
      )}
    </div>
  )
}
