import type { AISuggestionsProps } from '../../types/ai'
import styles from './styles.module.css'

const suggestions = [
  {
    id: 'storage',
    title: 'Armazenamento',
    question: 'Como devo armazenar o óleo usado no meu estabelecimento?',
  },
  {
    id: 'collection',
    title: 'Coletas',
    question: 'Como acompanho uma solicitação de coleta no Olius?',
  },
  {
    id: 'impact',
    title: 'Impacto ambiental',
    question: 'O que significam os indicadores de impacto ambiental?',
  },
]

export default function AISuggestions({ disabled, onSelect }: AISuggestionsProps) {
  return (
    <section aria-label="Sugestões de perguntas" className={styles.suggestions}>
      {suggestions.map((item) => (
        <button
          type="button"
          key={item.id}
          disabled={disabled}
          onClick={() => onSelect(item.question)}
        >
          <strong>{item.title}</strong>
          <span>{item.question}</span>
        </button>
      ))}
    </section>
  )
}
