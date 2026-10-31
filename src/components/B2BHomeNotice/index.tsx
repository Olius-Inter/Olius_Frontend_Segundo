import styles from '../../../styles/components/B2BHomeNotice/styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import type { B2BHomeNoticeProps } from '../../types/legacy-b2b-home/b2bHome'

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
