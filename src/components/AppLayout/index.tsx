import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <>
      <header className="app-header">
        <span className="app-name">Olius</span>
        <nav aria-label="Menu principal">
          <NavLink end to="/">Início</NavLink>
          <NavLink to="/motoristas">Motoristas</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
