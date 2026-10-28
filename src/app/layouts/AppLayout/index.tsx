import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import PortalProvider from '../../providers/PortalProvider'
import styles from './styles.module.css'
const navigation = [
  ['/', 'Visão geral'],
  ['/operacao', 'Operação'],
  ['/motoristas', 'Motorista'],
  ['/configuracoes/perfil', 'Configurações'],
]
export default function AppLayout() {
  return (
    <PortalProvider>
      <PortalShell />
    </PortalProvider>
  )
}
function PortalShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <img src="/Olius.svg" alt="Olius" width={125} height={62} />
        <p>PORTAL ADMINISTRATIVO</p>
        <nav aria-label="Menu principal">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            void logout().then(
              () => navigate('/login', { replace: true }),
              () =>
                navigate('/login', {
                  replace: true,
                  state: {
                    notice: 'Acesso local encerrado. A revogação no servidor não foi confirmada.',
                  },
                }),
            )
          }}
        >
          Sair da conta
        </button>
      </aside>
      <main id="admin-main" className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
