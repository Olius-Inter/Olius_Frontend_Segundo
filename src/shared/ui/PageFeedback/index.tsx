import styles from './styles.module.css'
import sharedStyles from '../../styles/shared.module.css'
import { mapClassNames } from '../../lib/classNames'
import type { PageFeedbackProps } from '../../types/page'
import { Inbox, LoaderCircle, SearchX, TriangleAlert } from 'lucide-react'

const classStyles = { ...styles, ...sharedStyles }

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
      className={mapClassNames(`card page-feedback page-feedback-${kind}`, classStyles)}
      role={kind === 'error' ? 'alert' : kind === 'not-found' ? undefined : 'status'}
    >
      <span className={styles['page-feedback-icon']} aria-hidden="true">
        <Icon size={32} strokeWidth={1.6} />
      </span>
      {label && <p className="eyebrow">{label}</p>}
      <Heading>{title}</Heading>
      <p className={styles['page-feedback-description']}>{description}</p>
      {children && <div className={styles['page-feedback-actions']}>{children}</div>}
    </section>
  )
}
