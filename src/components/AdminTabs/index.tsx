import { NavLink } from 'react-router-dom'
import type { AdminTabsProps } from '../../types/admin-records/admin'
import { adminTabs } from '../../data/admin-records/adminResources'
import styles from '../../../styles/components/AdminTabs/styles.module.css'

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
