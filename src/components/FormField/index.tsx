import styles from './styles.module.css'
import type { FormFieldProps } from '../../types/driverForm'

export default function FormField({ id, label, required, help, error, children }: FormFieldProps) {
  return (
    <div className={styles['field']}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {help && (
        <p className={styles['help']} id={`${id}-help`}>
          {help}
        </p>
      )}
      {error && (
        <p className={styles['field-error']} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
