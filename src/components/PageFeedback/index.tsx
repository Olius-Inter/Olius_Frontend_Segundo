import type { ReactNode } from 'react'
import { Inbox, LoaderCircle, SearchX, TriangleAlert } from 'lucide-react'

interface PageFeedbackProps {
  kind: 'loading' | 'empty' | 'error' | 'not-found'
  title: string
  description: string
  label?: string
  headingLevel?: 'h1' | 'h2'
  children?: ReactNode
}

const icons = {
  loading: LoaderCircle,
  empty: Inbox,
  error: TriangleAlert,
  'not-found': SearchX,
}

export default function PageFeedback({
  kind,
  title,
  description,
  label,
  headingLevel = 'h2',
  children,
}: PageFeedbackProps) {
  const Icon = icons[kind]
  const Heading = headingLevel

  return (
    <section
      className={`card page-feedback page-feedback-${kind}`}
      role={kind === 'error' ? 'alert' : kind === 'not-found' ? undefined : 'status'}
    >
      <span className="page-feedback-icon" aria-hidden="true">
        <Icon size={32} strokeWidth={1.6} />
      </span>
      {label && <p className="eyebrow">{label}</p>}
      <Heading>{title}</Heading>
      <p className="page-feedback-description">{description}</p>
      {children && <div className="page-feedback-actions">{children}</div>}
    </section>
  )
}
