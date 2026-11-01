import { useId, useRef } from 'react'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { X } from 'lucide-react'
import type { ModalProps } from '../../types/modal'
import styles from '../../../styles/components/Modal/styles.module.css'

export default function Modal({ open, title, onClose, busy = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useDialogFocus(ref, open)
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <header className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        <button
          autoFocus
          type="button"
          disabled={busy}
          aria-label="Fechar detalhes"
          onClick={onClose}
        >
          <X size={21} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.body}>{open && children}</div>
    </dialog>
  )
}
