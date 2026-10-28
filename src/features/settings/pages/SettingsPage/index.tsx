import { usePortalProfile } from '../../providers'
import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Accessibility, Palette, SlidersHorizontal, UserRound } from 'lucide-react'
import ProfilePanel from '../../components/ProfilePanel'
import AppearancePanel from '../../components/AppearancePanel'
import AccessibilityPanel from '../../components/AccessibilityPanel'
import PlansSettingsPage from '../PlansSettingsPage'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import NotFoundPage from '../../../../shared/ui/NotFoundPage'
import styles from './styles.module.css'

const sections = [
  { id: 'perfil', name: 'Perfil', Icon: UserRound },
  { id: 'aparencia', name: 'Aparência', Icon: Palette },
  { id: 'acessibilidade', name: 'Acessibilidade', Icon: Accessibility },
  { id: 'planos', name: 'Planos', Icon: SlidersHorizontal },
]
export default function SettingsPage() {
  const { section = 'perfil' } = useParams()
  const [notice, setNotice] = useState('')
  const profile = usePortalProfile()
  if (!sections.some((s) => s.id === section)) return <NotFoundPage />
  const data =
    profile.state.phase === 'ready' && profile.state.data.kind === 'ready'
      ? profile.state.data.data
      : null
  return (
    <div className={styles.page}>
      <header>
        <h1>Configurações</h1>
        <p>Sua conta e suas preferências em um só lugar.</p>
      </header>
      <div className={styles.window}>
        <nav className={styles.navigation} aria-label="Configurações">
          {sections.map(({ id, name, Icon }) => (
            <NavLink
              key={id}
              to={`/configuracoes/${id}`}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              <Icon size={18} aria-hidden="true" />
              {name}
            </NavLink>
          ))}
        </nav>
        <div className={styles.content}>
          {section === 'perfil' && (
            <>
              {notice && <p role="status">{notice}</p>}
              {data && (
                <ProfilePanel
                  key={`${data.id}:${data.name}:${data.email}:${data.telephone}`}
                  profile={data}
                  onSaved={setNotice}
                />
              )}
              {profile.state.phase === 'loading' && (
                <PageFeedback
                  kind="loading"
                  title="Carregando perfil"
                  description="Consultando os dados da conta."
                />
              )}
              {profile.state.phase === 'error' && (
                <PageFeedback
                  kind="error"
                  title="Não foi possível consultar seu perfil"
                  description={profile.state.message}
                >
                  <button type="button" onClick={profile.reload}>
                    Tentar novamente
                  </button>
                </PageFeedback>
              )}
              {profile.state.phase === 'ready' && profile.state.data.kind === 'unavailable' && (
                <p>{profile.state.data.message}</p>
              )}
            </>
          )}
          {section === 'aparencia' && <AppearancePanel />}
          {section === 'acessibilidade' && <AccessibilityPanel />}
          {section === 'planos' && <PlansSettingsPage />}
        </div>
      </div>
    </div>
  )
}
