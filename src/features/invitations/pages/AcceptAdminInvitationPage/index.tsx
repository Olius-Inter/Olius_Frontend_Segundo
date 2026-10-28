import { Link } from 'react-router-dom'
import { useAcceptAdminInvitation } from '../../hooks/useAcceptAdminInvitation'
import styles from './styles.module.css'

export default function AcceptAdminInvitationPage() {
  const {
    state,
    reload,
    preview,
    tokenPresent,
    values,
    setValues,
    showPassword,
    setShowPassword,
    feedback,
    submit,
    available,
  } = useAcceptAdminInvitation()
  const unavailable =
    state.phase === 'ready' && state.data.kind === 'unavailable' ? state.data.message : ''
  const statusMessages = {
    ACCEPTED: 'Este convite já foi aceito. Entre com sua conta.',
    EXPIRED: 'Este convite expirou. Solicite um novo convite ao administrador.',
    REVOKED: 'Este convite foi revogado e não pode mais ser utilizado.',
  }
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <img src="/Olius.svg" width={130} height={64} alt="Olius" />
        {feedback.accepted ? (
          <>
            <h1>Convite aceito</h1>
            <p>Sua senha foi definida. Entre para acessar o portal.</p>
            <Link className={styles.primary} to="/login">
              Ir para o login
            </Link>
          </>
        ) : (
          <>
            <h1>Aceitar convite</h1>
            {!tokenPresent ? (
              <p role="alert">
                O link não contém um convite válido. Abra o link recebido ou solicite um novo
                convite.
              </p>
            ) : (
              <>
                {state.phase === 'loading' && <p role="status">Verificando convite…</p>}
                {state.phase === 'error' && (
                  <>
                    <p role="alert">{state.message}</p>
                    <button type="button" onClick={reload}>
                      Tentar novamente
                    </button>
                  </>
                )}
                {unavailable && <p role="status">{unavailable}</p>}
                {preview && preview.status !== 'PENDING' && (
                  <p role="status">{statusMessages[preview.status]}</p>
                )}
                {(preview?.status === 'PENDING' || Boolean(unavailable)) && (
                  <>
                    <p>
                      {preview ? (
                        <>
                          Olá, <strong>{preview.name}</strong>. Defina sua senha para aceitar o
                          convite enviado a {preview.email}.
                        </>
                      ) : (
                        'Defina sua senha para aceitar o convite recebido.'
                      )}
                    </p>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault()
                        void submit()
                      }}
                    >
                      <label>
                        Senha
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={10}
                          maxLength={128}
                          disabled={feedback.busy}
                          value={values.password}
                          aria-describedby="invitation-password-help"
                          onChange={(event) =>
                            setValues((previous) => ({ ...previous, password: event.target.value }))
                          }
                        />
                      </label>
                      <small id="invitation-password-help">
                        10–128 caracteres, com letra maiúscula, número e símbolo.
                      </small>
                      <label>
                        Confirmação de senha
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={10}
                          maxLength={128}
                          disabled={feedback.busy}
                          value={values.confirmation}
                          onChange={(event) =>
                            setValues((previous) => ({
                              ...previous,
                              confirmation: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className={styles.visibility}
                        aria-pressed={showPassword}
                        disabled={feedback.busy}
                        onClick={() => setShowPassword((previous) => !previous)}
                      >
                        {showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
                      </button>
                      {feedback.error && <p role="alert">{feedback.error}</p>}
                      {!available && <p role="status">O aceite de convites aguarda integração.</p>}
                      <button
                        type="submit"
                        className={styles.primary}
                        disabled={feedback.busy || !available}
                      >
                        {feedback.busy ? 'Aceitando…' : 'Aceitar convite'}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
            <Link to="/login">Voltar para o login</Link>
          </>
        )}
      </section>
    </main>
  )
}
