import { CalendarDays, Droplets, ClipboardList, ArrowUpRight } from 'lucide-react'
import type { PromptSuggestionsProps } from '../../types/assistant'
import styles from './styles.module.css'
const suggestions = [
  {
    Icon: ClipboardList,
    title: 'Solicitações',
    question: 'Como organizar as solicitações de coleta pendentes?',
  },
  {
    Icon: CalendarDays,
    title: 'Agenda de coletas',
    question: 'Como planejar várias coletas no mesmo dia?',
  },
  {
    Icon: Droplets,
    title: 'Volume de óleo',
    question: 'Qual a diferença entre volume estimado e confirmado?',
  },
]
export default function PromptSuggestions({ disabled, onSelect }: PromptSuggestionsProps) {
  return (
    <section className={styles.suggestions} aria-label="Perguntas sugeridas">
      {suggestions.map(({ Icon, title, question }) => (
        <button key={title} type="button" disabled={disabled} onClick={() => onSelect(question)}>
          <span className={styles.top}>
            <Icon size={21} aria-hidden="true" />
            <ArrowUpRight size={17} aria-hidden="true" />
          </span>
          <strong>{title}</strong>
          <span>{question}</span>
        </button>
      ))}
    </section>
  )
}
