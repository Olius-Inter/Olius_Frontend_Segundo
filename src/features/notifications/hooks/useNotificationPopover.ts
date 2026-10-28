import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { NotificationPopoverPosition } from '../types/notifications'

export function useNotificationPopover() {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<NotificationPopoverPosition>({})
  const location = useLocation()

  useEffect(() => {
    panel.current?.hidePopover()
  }, [location.key])

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect()
      if (!anchor) return
      const width = Math.min(480, window.innerWidth - 32)
      const top = anchor.bottom + 12
      const left = Math.max(16, Math.min(anchor.right - width, window.innerWidth - width - 16))
      setPosition({ top, left, width, maxHeight: Math.max(80, window.innerHeight - top - 16) })
    }
    const dismissOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return
      if (panel.current?.contains(event.target) || trigger.current?.contains(event.target)) return
      panel.current?.hidePopover()
    }
    document.addEventListener('click', dismissOutside, true)
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('click', dismissOutside, true)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  return { id, trigger, panel, open, setOpen, position }
}
