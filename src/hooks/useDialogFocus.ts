import { useEffect } from 'react'
import type { RefObject } from 'react'

// O dialog nativo mantém o foco dentro do modal e trata Escape.
export function useDialogFocus(ref: RefObject<HTMLDialogElement | null>, open: boolean): void {
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const main = document.querySelector('main')
    const previousMainOverflow = main?.style.overflow ?? ''
    const previousOverflow = document.body.style.overflow
    if (!dialog.open) dialog.showModal()
    if (main) main.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ),
      ].filter((item) => item.offsetParent !== null)
      const target = event.shiftKey ? items.at(-1) : items[0]
      if (
        !items.length ||
        (event.shiftKey
          ? document.activeElement === items[0]
          : document.activeElement === items.at(-1))
      ) {
        event.preventDefault()
        ;(target ?? dialog).focus()
      }
    }
    dialog.addEventListener('keydown', keepFocus)
    return () => {
      dialog.removeEventListener('keydown', keepFocus)
      if (dialog.open) dialog.close()
      if (main) main.style.overflow = previousMainOverflow
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
      else main?.focus({ preventScroll: true })
    }
  }, [ref, open])
}
