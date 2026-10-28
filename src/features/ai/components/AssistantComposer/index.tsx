import { useId } from 'react'
import { Send } from 'lucide-react'
import type { AssistantComposerProps } from '../../types/assistant'
import styles from './styles.module.css'

export default function AssistantComposer(props: AssistantComposerProps) {
  const id = useId()
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault()
        props.onSend()
      }}
      aria-busy={props.busy}
    >
      <div className={styles.inputRow}>
        <label className={styles.label} htmlFor={id}>
          Sua mensagem
        </label>
        <textarea
          id={id}
          ref={props.inputRef}
          value={props.message}
          onChange={(event) => props.onMessage(event.target.value)}
          placeholder="Como posso ajudar na sua operação?"
          maxLength={4000}
          rows={2}
          disabled={props.busy}
          aria-describedby={id + '-help'}
        />
        <button
          className={styles.send}
          type="submit"
          aria-label={props.busy ? 'Enviando mensagem' : 'Enviar mensagem'}
          title={props.busy ? 'Enviando…' : 'Enviar'}
          disabled={props.busy || !props.message.trim()}
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.footer}>
        <span id={id + '-help'}>Mensagem de texto</span>
        <span>{props.message.length.toLocaleString('pt-BR')}/4.000</span>
      </div>
      <p className={styles.feedback} role="status">
        {props.feedback}
      </p>
    </form>
  )
}
