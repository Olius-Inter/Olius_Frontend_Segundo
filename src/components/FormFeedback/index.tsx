import styles from '../../../styles/components/FormFeedback/styles.module.css'
import type { FormFeedbackProps } from '../../types/drivers/form'

export default function FormFeedback({ checked, valid }: FormFeedbackProps) {
  if (!checked) return null
  return valid ? (
    <div className={[styles['feedback'], styles['success']].join(' ')} role="status">
      Os campos estão válidos. Nenhum dado foi enviado ou salvo.
    </div>
  ) : (
    <div className={[styles['feedback'], styles['error']].join(' ')} role="alert">
      Revise os campos indicados antes de continuar.
    </div>
  )
}
