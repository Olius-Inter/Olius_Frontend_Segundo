import { usePortalProfile } from '../../../features/settings/providers'
import { NotificationPopover } from '../../../features/notifications'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  House,
  CalendarDays,
  Truck,
  Settings,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import PageFeedback from '../../../shared/ui/PageFeedback'
import SpeechControls from '../../../features/settings/components/SpeechControls'
import PortalProvider from '../../providers/PortalProvider'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import { usePreferences } from '../../../features/settings/hooks/usePreferences'
import styles from './styles.module.css'

const navigation = [
  { to: '/', label: 'Visão geral', Icon: House },
  { to: '/operacao', label: 'Operação', Icon: CalendarDays },
  { to: '/motoristas', label: 'Motorista', Icon: Truck },
]
export default function AppLayout() {
  return (
    <PortalProvider>
      <PortalShell />
    </PortalProvider>
  )
}
function PortalShell() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menu = useRef<HTMLButtonElement>(null)
  const main = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const profile = usePortalProfile()
  const { preferences } = usePreferences()
  const person =
    profile.state.phase === 'ready' && profile.state.data.kind === 'ready'
      ? profile.state.data.data
      : null
  useEffect(() => {
    main.current?.scrollTo({ top: 0, left: 0 })
    main.current?.focus({ preventScroll: true })
  }, [pathname])
  function close() {
    setOpen(false)
    if (menu.current?.offsetParent) menu.current.focus()
  }
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#admin-main">
        Ir para o conteúdo
      </a>
      <header className={styles.mobile}>
        <Link to="/" aria-label="Olius — visão geral">
          <img src="/Olius.svg" alt="" width={105} height={50} />
        </Link>
        <button
          ref={menu}
          type="button"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen((previous) => !previous)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>{open ? 'Fechar menu' : 'Abrir menu'}</span>
        </button>
      </header>
      <aside id="admin-sidebar" className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <Link className={styles.brand} to="/" aria-label="Olius — visão geral">
          <img src="/Olius.svg" alt="" width={125} height={62} />
        </Link>
        <p className={styles.caption}>PORTAL ADMINISTRATIVO</p>
        <nav aria-label="Menu principal">
          {navigation.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <footer className={styles.footer}>
          <NavLink
            to="/configuracoes/perfil"
            onClick={close}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <Settings size={19} aria-hidden="true" />
            Configurações
          </NavLink>
          <NavLink
            to="/administracao"
            onClick={close}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <ShieldCheck size={19} aria-hidden="true" />
            Administração
          </NavLink>
          <Link className={styles.profileLink} to="/configuracoes/perfil" onClick={close}>
            {person?.avatarUrl ? (
              <img src={person.avatarUrl} width={34} height={34} alt="" />
            ) : (
              <UserRound size={25} aria-hidden="true" />
            )}
            <span>
              {person?.name ?? (state.phase === 'ready' ? state.user.name : 'Administrador')}
            </span>
          </Link>
          <button
            type="button"
            disabled={loggingOut}
            onClick={async () => {
              if (loggingOut) return
              setLoggingOut(true)
              try {
                await logout()
                navigate('/login', { replace: true })
              } catch {
                navigate('/login', {
                  replace: true,
                  state: {
                    notice:
                      'Acesso local encerrado. Não foi possível confirmar a revogação no servidor.',
                  },
                })
              }
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            {loggingOut ? 'Saindo…' : 'Sair da conta'}
          </button>
        </footer>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <span>Operação da empresa administradora</span>
          <div className={styles.account}>
            <NotificationPopover />
            <Link
              className={styles.avatar}
              to="/configuracoes/perfil"
              aria-label="Abrir configurações de perfil"
            >
              {person?.avatarUrl ? (
                <img src={person.avatarUrl} width={38} height={38} alt="" />
              ) : (
                <UserRound size={21} aria-hidden="true" />
              )}
            </Link>
            <strong>ADMIN</strong>
          </div>
        </header>
        <main id="admin-main" ref={main} tabIndex={-1} className={styles.content}>
          <Suspense
            fallback={
              <PageFeedback
                kind="loading"
                title="Carregando página"
                description="Preparando a área administrativa."
              />
            }
          >
            {preferences.reader && (
              <div className={styles.reader}>
                <SpeechControls />
              </div>
            )}
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
