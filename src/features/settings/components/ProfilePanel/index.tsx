import { Eye, EyeOff, UserRound } from 'lucide-react'
import type { ProfilePanelProps } from '../../types/settings'
import { useProfileSettings } from '../../hooks/useProfileSettings'
import styles from './styles.module.css'

export default function ProfilePanel({ profile, onSaved }: ProfilePanelProps) {
  const {
    values,
    setValues,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    preview,
    feedback,
    chooseAvatar,
    run,
    canSave,
    canChangePassword,
  } = useProfileSettings(profile, onSaved)
  return (
    <div className={styles.profile}>
      <header>
        <h2>Perfil</h2>
        <p>Sua imagem e os dados da sua conta administrativa.</p>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void run('profile')
        }}
      >
        <div className={styles.photo}>
          {preview ? (
            <img src={preview} alt="Sua imagem de perfil" width={80} height={80} />
          ) : (
            <span>
              <UserRound size={32} aria-hidden="true" />
            </span>
          )}
          <div>
            <label className={styles.upload}>
              Alterar imagem
              <input
                disabled={feedback.busy}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  chooseAvatar(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
            <button
              type="button"
              disabled={feedback.busy}
              onClick={() =>
                setValues((previous) => ({ ...previous, avatar: null, removeAvatar: true }))
              }
            >
              Remover imagem
            </button>
            <small>PNG, JPEG ou WebP · até 2 MB</small>
          </div>
        </div>
        <label>
          Nome
          <input
            required
            maxLength={150}
            disabled={feedback.busy}
            autoComplete="name"
            value={values.name}
            onChange={(e) => setValues((previous) => ({ ...previous, name: e.target.value }))}
          />
        </label>
        <label>
          E-mail
          <input
            required
            type="email"
            maxLength={255}
            disabled={feedback.busy}
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues((previous) => ({ ...previous, email: e.target.value }))}
          />
        </label>
        <label>
          Telefone
          <input
            type="tel"
            maxLength={22}
            disabled={feedback.busy}
            autoComplete="tel"
            value={values.telephone}
            onChange={(e) => setValues((previous) => ({ ...previous, telephone: e.target.value }))}
          />
        </label>
        {!canSave && (
          <p>
            A edição dos dados aguarda um endpoint autorizado. A consulta do perfil já usa a Core.
          </p>
        )}
        <button className={styles.primary} type="submit" disabled={!canSave || feedback.busy}>
          {feedback.busy ? 'Salvando…' : 'Salvar perfil'}
        </button>
      </form>
      <details className={styles.password}>
        <summary>Alterar senha</summary>
        <p>Use a senha atual para definir uma nova senha.</p>
        <form
          data-reader-exclude
          onSubmit={(e) => {
            e.preventDefault()
            void run('password')
          }}
        >
          <label>
            Senha atual
            <input
              required
              type={showPassword ? 'text' : 'password'}
              disabled={feedback.busy}
              maxLength={256}
              autoComplete="current-password"
              value={password.current}
              onChange={(e) =>
                setPassword((previous) => ({ ...previous, current: e.target.value }))
              }
            />
          </label>
          <label>
            Nova senha
            <input
              required
              type={showPassword ? 'text' : 'password'}
              disabled={feedback.busy}
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              value={password.next}
              onChange={(e) => setPassword((previous) => ({ ...previous, next: e.target.value }))}
              aria-describedby="new-password-help"
            />
          </label>
          <small id="new-password-help">
            10–128 caracteres, com letra maiúscula, número e símbolo.
          </small>
          <label>
            Confirmar nova senha
            <input
              required
              type={showPassword ? 'text' : 'password'}
              disabled={feedback.busy}
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              value={password.confirmation}
              onChange={(e) =>
                setPassword((previous) => ({ ...previous, confirmation: e.target.value }))
              }
            />
          </label>
          <button
            type="button"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
            {showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
          </button>
          {!canChangePassword && (
            <p>O salvamento da nova senha aguarda o contrato de segurança da API.</p>
          )}
          <button
            type="submit"
            className={styles.primary}
            disabled={!canChangePassword || feedback.busy}
          >
            Alterar senha
          </button>
        </form>
      </details>
      {feedback.error && (
        <p role="alert" className={styles.error}>
          {feedback.error}
        </p>
      )}
      {feedback.success && <p role="status">{feedback.success}</p>}
    </div>
  )
}
