import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { resolveAdminArea, resolveAdminResource } from '../../lib/adminNavigation'
import { isUuid } from '../../../../shared/lib/isUuid'
import NotFoundPage from '../../../../shared/ui/NotFoundPage'

// Links antigos e notificações passam a abrir o mesmo popup sobre a listagem.
export default function AdminDetailPage() {
  const { area: rawArea, tab, id } = useParams()
  const [search] = useSearchParams()
  const { pathname } = useLocation()
  const driver =
    pathname.startsWith('/motoristas/') || pathname.startsWith('/cadastros/motoristas/')
  const area = driver ? 'cadastros' : resolveAdminArea(rawArea)
  const resource = driver ? 'drivers' : area && tab ? resolveAdminResource(area, tab, search) : null
  if (!resource || !id || !isUuid(id)) return <NotFoundPage />
  const params = new URLSearchParams(search)
  params.set('registro', id)
  return <Navigate replace to={`${driver ? '/motoristas' : `/${area}/${tab}`}?${params}`} />
}
