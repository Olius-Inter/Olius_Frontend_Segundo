import { MessageCircle } from 'lucide-react'
import type { AIConversationProps } from '../../types/ai'
import styles from './styles.module.css'

export default function AIConversation({ messages, pending }: AIConversationProps) {
  return (
    <section className={styles.conversation} aria-label="Conversa com o assistente">
      {!messages.length && !pending && (
        <div className={styles.empty}>
          <MessageCircle size={35} aria-hidden="true" />
          <h2>Como podemos ajudar?</h2>
          <p>Escolha um tema ou escreva sua pergunta abaixo.</p>
        </div>
      )}
      <div
        role="log"
        aria-label="Mensagens da conversa"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`${styles.message} ${message.role === 'user' ? styles.user : ''}`}
          >
            <h3>{message.role === 'user' ? 'Você' : 'Assistente Olius'}</h3>
            <p>{message.content}</p>
          </article>
        ))}
      </div>
      {pending && <p role="status">Consultando o assistente…</p>}
    </section>
  )
}
