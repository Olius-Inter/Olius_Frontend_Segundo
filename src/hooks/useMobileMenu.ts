import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useMobileMenu(
  open: boolean,
  close: () => void,
  sidebar: RefObject<HTMLElement | null>,
  workspace: RefObject<HTMLDivElement | null>,
  trigger: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!open) return
    const media = window.matchMedia('(max-width: 850px)')
    if (!media.matches) {
      close()
      return
    }
    const content = workspace.current
    if (content) content.inert = true
    const focusable = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)') ?? [],
      ).filter((node) => node.getClientRects().length > 0)
    focusable()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return
      const controls = focusable()
      const first = controls[0],
        last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const resize = () => {
      if (!media.matches) close()
    }
    window.addEventListener('keydown', onKey)
    media.addEventListener('change', resize)
    return () => {
      if (content) content.inert = false
      if (trigger.current?.offsetParent) trigger.current.focus({ preventScroll: true })
      window.removeEventListener('keydown', onKey)
      media.removeEventListener('change', resize)
    }
  }, [open, close, sidebar, workspace, trigger])
}
