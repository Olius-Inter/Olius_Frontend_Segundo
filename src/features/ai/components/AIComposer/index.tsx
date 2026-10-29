import type { AIComposerProps } from '../../types/ai'
import styles from './styles.module.css'

export default function AIComposer({
  draft,
  pending,
  configured,
  onChange,
  onSubmit,
  onCancel,
}: AIComposerProps) {
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="ai-question">Sua pergunta</label>
      <textarea
        id="ai-question"
        rows={4}
        value={draft}
        maxLength={2000}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escreva sua dúvida sobre o Olius…"
        aria-describedby="ai-question-help"
      />
      <div className={styles.actions}>
        <p id="ai-question-help">{draft.length}/2.000 caracteres · Enter cria uma nova linha.</p>
        {pending ? (
          <button type="button" onClick={onCancel}>
            Cancelar consulta
          </button>
        ) : (
          <button type="submit" disabled={!configured || !draft.trim()}>
            Enviar pergunta
          </button>
        )}
      </div>
    </form>
  )
}
