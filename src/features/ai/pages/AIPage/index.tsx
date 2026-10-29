import AIHeader from '../../components/AIHeader'
import AIStatus from '../../components/AIStatus'
import AISuggestions from '../../components/AISuggestions'
import AIConversation from '../../components/AIConversation'
import AIComposer from '../../components/AIComposer'
import { useAI } from '../../hooks/useAI'
import styles from './styles.module.css'

export default function AIPage() {
  const { state, draft, setDraft, send, cancel, reset, configured } = useAI()
  const pending = state.phase === 'pending'
  return (
    <div className={styles.page}>
      <AIHeader />
      <AIStatus configured={configured} error={state.phase === 'error' ? state.error : null} />
      <AISuggestions disabled={pending} onSelect={setDraft} />
      <div className={styles.heading}>
        <h2>Assistente</h2>
        <button
          type="button"
          disabled={pending || (!state.messages.length && !draft)}
          onClick={reset}
        >
          Nova conversa
        </button>
      </div>
      <AIConversation messages={state.messages} pending={pending} />
      <AIComposer
        draft={draft}
        pending={pending}
        configured={configured}
        onChange={setDraft}
        onSubmit={() => void send()}
        onCancel={cancel}
      />
    </div>
  )
}
