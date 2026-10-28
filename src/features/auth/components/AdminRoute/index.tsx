import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import PageFeedback from '../../../../shared/ui/PageFeedback'

export default function AdminRoute() {
  const { state, retry } = useAuth()
  const location = useLocation()
  if (state.phase === 'ready') return <Outlet />
  if (state.phase === 'loading')
    return (
      <PageFeedback
        kind="loading"
        title="Verificando acesso"
        description="Validando sua sessão administrativa."
      />
    )
  if (state.phase === 'error')
    return (
      <PageFeedback
        kind="error"
        title="Não foi possível validar a sessão"
        description={state.message}
      >
        <button type="button" onClick={retry}>
          Tentar novamente
        </button>
      </PageFeedback>
    )
  return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
}
