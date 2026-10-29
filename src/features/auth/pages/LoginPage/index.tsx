import { useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.css'

export default function LoginPage() {
  const { state, login, retry } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [feedback, setFeedback] = useState({ busy: false, message: '' })
  const lock = useRef(false)
  const from: unknown = location.state?.from
  const target =
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !from.startsWith('/login')
      ? from
      : '/'
  if (state.phase === 'ready') return <Navigate to={target} replace />
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <img src="/Olius.svg" alt="Olius" width="130" height="64" />
        <p>PORTAL ADMINISTRATIVO</p>
        <h1>Acesse a operação</h1>
        <p>Exclusivo para contas ADMIN da empresa operadora.</p>
        {typeof location.state?.notice === 'string' && <p role="status">{location.state.notice}</p>}
        {state.phase === 'not-configured' && (
          <p role="status">A conexão com a Core ainda não está configurada.</p>
        )}
        {state.phase === 'forbidden' && (
          <p role="alert">Sua conta não possui acesso administrativo. Entre com uma conta ADMIN.</p>
        )}
        {state.phase === 'loading' ? (
          <p role="status">Verificando sessão…</p>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              if (lock.current) return
              lock.current = true
              setFeedback({ busy: true, message: '' })
              try {
                await login({ email: values.email.trim(), password: values.password })
                setValues((previous) => ({ ...previous, password: '' }))
              } catch (error: unknown) {
                setFeedback({
                  busy: false,
                  message: error instanceof Error ? error.message : 'Não foi possível entrar.',
                })
              } finally {
                lock.current = false
                setFeedback((previous) => ({ ...previous, busy: false }))
              }
            }}
          >
            <label>
              E-mail
              <input
                type="email"
                required
                maxLength={255}
                autoComplete="username"
                value={values.email}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, email: event.target.value }))
                }
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                required
                maxLength={256}
                autoComplete="current-password"
                value={values.password}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, password: event.target.value }))
                }
              />
            </label>
            {feedback.message && <p role="alert">{feedback.message}</p>}
            <button type="submit" disabled={feedback.busy || state.phase === 'not-configured'}>
              {feedback.busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}
        {state.phase === 'error' && (
          <>
            <p role="alert">{state.message}</p>
            <button type="button" onClick={retry}>
              Verificar sessão novamente
            </button>
          </>
        )}
      </section>
    </main>
  )
}
