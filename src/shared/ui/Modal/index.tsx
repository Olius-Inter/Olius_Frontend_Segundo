import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import type { ModalProps } from '../../types/modal'
import styles from './styles.module.css'

export default function Modal({ open, title, onClose, busy = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) {
      ref.current?.close()
      return
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ref.current?.showModal()
    const content = document.querySelector('main')
    const contentOverflow = content?.style.overflow ?? ''
    if (content) content.style.overflow = 'hidden'
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
      if (content) content.style.overflow = contentOverflow
      ref.current?.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])
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
