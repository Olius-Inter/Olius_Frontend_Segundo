import { NavLink } from 'react-router-dom'
import type { AdminTabsProps } from '../../types/admin'
import { adminTabs } from '../../data/adminResources'
import styles from './styles.module.css'

export default function AdminTabs({ area }: AdminTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Seções da área">
      {adminTabs[area].map((tab) => (
        <NavLink
          key={tab.slug}
          to={`/${area}/${tab.slug}`}
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          {tab.title}
        </NavLink>
      ))}
    </nav>
  )
}
