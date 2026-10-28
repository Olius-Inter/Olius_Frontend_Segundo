import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useAssistant } from '../../hooks/useAssistant'
import AssistantComposer from '../../components/AssistantComposer'
import PromptSuggestions from '../../components/PromptSuggestions'
import styles from './styles.module.css'
export default function AssistantPage() {
  const assistant = useAssistant()
  const latest = useRef<HTMLDivElement>(null)
  useEffect(() => {
    latest.current?.scrollIntoView({ block: 'nearest' })
  }, [assistant.messages.length])
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <Sparkles size={20} aria-hidden="true" />
        <span>Assistente Olius</span>
      </header>
      <div className={styles.workspace}>
        {!assistant.messages.length && (
          <div className={styles.welcome}>
            <div className={styles.symbol}>
              <Sparkles size={38} aria-hidden="true" />
            </div>
            <p>Seu assistente para o dia a dia</p>
            <h1>Como posso ajudar hoje?</h1>
            <span>Tire dúvidas sobre solicitações, coletas e a operação da sua empresa.</span>
          </div>
        )}
        {assistant.messages.length > 0 && (
          <section
            className={styles.conversation}
            aria-label="Conversa com o assistente"
            aria-live="polite"
            aria-relevant="additions"
          >
            {assistant.messages.map((item) => (
              <article key={item.id} className={item.role === 'user' ? styles.user : styles.reply}>
                <strong>{item.role === 'user' ? 'Você' : 'Assistente Olius'}</strong>
                {item.text && <p>{item.text}</p>}
              </article>
            ))}
            <div ref={latest} />
          </section>
        )}
        <AssistantComposer
          message={assistant.message}
          busy={assistant.busy}
          feedback={assistant.feedback}
          inputRef={assistant.inputRef}
          onMessage={assistant.setMessage}
          onSend={assistant.send}
        />
        {!assistant.messages.length && (
          <PromptSuggestions disabled={assistant.busy} onSelect={assistant.selectQuestion} />
        )}
      </div>
    </div>
  )
}
