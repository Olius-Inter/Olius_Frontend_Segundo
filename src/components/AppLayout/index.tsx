import styles from './styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Bell,
  House,
  Truck,
  UserRound,
  FileChartColumn,
  History,
  Trophy,
} from 'lucide-react'
import PageFeedback from '../PageFeedback'

const classStyles = { ...styles }

export default function AppLayout() {
  return (
    <div className={styles['shell']}>
      <aside className={styles['sidebar']}>
        <Link className={styles['brand']} to="/" aria-label="Olius — início">
          <img src="/Olius.svg" alt="" width="122" height="60" />
        </Link>
        <nav aria-label="Menu principal">
          <NavLink
            end
            to="/"
            className={({ isActive }) =>
              mapClassNames(`nav-link${isActive ? ' active' : ''}`, classStyles)
            }
          >
            <House size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Início</span>
          </NavLink>
          <NavLink
            to="/relatorios"
            className={({ isActive }) =>
              mapClassNames(`nav-link${isActive ? ' active' : ''}`, classStyles)
            }
          >
            <FileChartColumn size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Relatórios</span>
          </NavLink>
          <NavLink
            to="/motoristas"
            className={({ isActive }) =>
              mapClassNames(`nav-link${isActive ? ' active' : ''}`, classStyles)
            }
          >
            <Truck size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Motoristas</span>
          </NavLink>
          <NavLink
            to="/historico"
            className={({ isActive }) =>
              mapClassNames(`nav-link${isActive ? ' active' : ''}`, classStyles)
            }
          >
            <History size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Histórico</span>
          </NavLink>
          <NavLink
            to="/ranking"
            className={({ isActive }) =>
              mapClassNames(`nav-link${isActive ? ' active' : ''}`, classStyles)
            }
          >
            <Trophy size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Ranking</span>
          </NavLink>
        </nav>
      </aside>
      <div className={styles['workspace']}>
        <header className={styles['topbar']}>
          <div className={styles['topbar-account']}>
            <Bell size={17} aria-hidden="true" />
            <span className={styles['account-avatar']}>
              <UserRound size={17} aria-hidden="true" />
            </span>
            <span>Área administrativa</span>
          </div>
        </header>
        <main className={styles['content']}>
          <Suspense
            fallback={
              <PageFeedback
                kind="loading"
                title="Carregando página"
                description="Aguarde enquanto a página é preparada."
              />
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
