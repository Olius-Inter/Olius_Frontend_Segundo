import { useId, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useLogin } from '../../hooks/auth/useLogin'
import styles from '../../../styles/pages/LoginPage/styles.module.css'

export default function LoginPage() {
  const { state, retry, values, errors, feedback, target, notice, change, blur, submit } =
    useLogin()
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  if (state.phase === 'ready') return <Navigate to={target} replace />
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <img src="/Olius.svg" alt="Olius" width="130" height="64" />
        <p>PORTAL ADMINISTRATIVO</p>
        <h1>Acesse a operação</h1>
        <p>Exclusivo para contas ADMIN da empresa operadora.</p>
        {notice && <p role="status">{notice}</p>}
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
            ref={formRef}
            noValidate
            aria-busy={feedback.busy}
            onSubmit={(event) => {
              event.preventDefault()
              void submit().then((field) => {
                if (field)
                  formRef.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
              })
            }}
          >
            <label htmlFor={`${id}-email`}>
              E-mail
              <input
                id={`${id}-email`}
                name="email"
                disabled={feedback.busy}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                onBlur={() => blur('email')}
                type="email"
                required
                maxLength={255}
                autoComplete="username"
                value={values.email}
                onChange={(event) => change('email', event.target.value)}
              />
            </label>
            {errors.email && (
              <p id={`${id}-email-error`} role="alert">
                {errors.email}
              </p>
            )}
            <label htmlFor={`${id}-password`}>
              Senha
              <input
                id={`${id}-password`}
                name="password"
                disabled={feedback.busy}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? `${id}-password-error` : undefined}
                onBlur={() => blur('password')}
                type="password"
                required
                maxLength={256}
                autoComplete="current-password"
                value={values.password}
                onChange={(event) => change('password', event.target.value)}
              />
            </label>
            {errors.password && (
              <p id={`${id}-password-error`} role="alert">
                {errors.password}
              </p>
            )}
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
