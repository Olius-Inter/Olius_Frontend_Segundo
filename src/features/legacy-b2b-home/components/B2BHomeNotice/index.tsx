import styles from './styles.module.css'
import { mapClassNames } from '../../../../shared/lib/classNames'
import type { B2BHomeNoticeProps } from '../../types/b2bHome'

const classStyles = { ...styles }

export default function B2BHomeNotice({ children, kind = 'info' }: B2BHomeNoticeProps) {
  return (
    <div
      className={mapClassNames(`b2b-notice b2b-notice-${kind}`, classStyles)}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
