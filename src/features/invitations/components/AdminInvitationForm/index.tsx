import type { InvitationFormProps } from '../../types/adminInvitation'
import styles from './styles.module.css'

export default function AdminInvitationForm({
  values,
  onChange,
  onSubmit,
  busy,
  available,
  error,
}: InvitationFormProps) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <p>O destinatário definirá a própria senha pelo link do convite, válido por 24 horas.</p>
      <label>
        Nome
        <input
          required
          maxLength={150}
          autoComplete="name"
          disabled={busy}
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
        />
      </label>
      <label>
        E-mail
        <input
          required
          type="email"
          maxLength={255}
          autoComplete="email"
          disabled={busy}
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
        />
      </label>
      {!available && <p role="status">O envio de convites aguarda integração.</p>}
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy || !available}>
        {busy ? 'Enviando…' : 'Enviar convite'}
      </button>
    </form>
  )
}
