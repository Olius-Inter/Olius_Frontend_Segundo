import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, House, Truck, UserRound } from 'lucide-react'

export default function AppLayout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="Olius — início">
          <img src="/Olius.svg" alt="" width="122" height="60" />
        </Link>
        <nav aria-label="Menu principal">
          <NavLink end to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <House size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Início</span>
          </NavLink>
          <NavLink to="/motoristas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Truck size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Motoristas</span>
          </NavLink>
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-account">
            <Bell size={17} aria-hidden="true" />
            <span className="account-avatar"><UserRound size={17} aria-hidden="true" /></span>
            <span>Área administrativa</span>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
