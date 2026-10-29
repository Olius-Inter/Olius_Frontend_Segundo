import { Moon, Sun } from 'lucide-react'
import { usePreferences } from '../../hooks/usePreferences'
import styles from './styles.module.css'

export default function AppearancePanel() {
  const { preferences, change } = usePreferences()
  return (
    <section>
      <h2>Aparência</h2>
      <p className={styles.help}>Escolha como o Olius aparece para você.</p>
      <div className={styles.choices} role="group" aria-label="Tema do portal">
        <button
          type="button"
          aria-pressed={preferences.theme === 'light'}
          onClick={() => change({ theme: 'light' })}
        >
          <span className={styles.light}>
            <i />
            <i />
            <i />
          </span>
          <Sun size={19} aria-hidden="true" />
          Claro
        </button>
        <button
          type="button"
          aria-pressed={preferences.theme === 'dark'}
          onClick={() => change({ theme: 'dark' })}
        >
          <span className={styles.dark}>
            <i />
            <i />
            <i />
          </span>
          <Moon size={19} aria-hidden="true" />
          Escuro
        </button>
      </div>
    </section>
  )
}
