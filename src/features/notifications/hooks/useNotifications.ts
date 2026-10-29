import { useCallback, useEffect, useRef, useState } from 'react'
import type { NotificationQuery } from '../types/notifications'
import {
  getNotifications,
  simulateNotification,
  updateNotifications,
} from '../api/notificationService'
import { portalGateway } from '../api/notificationsGateway'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'

export function useNotifications() {
  const [query, setQuery] = useState<NotificationQuery>({
    category: 'ALL',
    unreadOnly: false,
    page: 1,
    pageSize: 10,
  })
  const [feedback, setFeedback] = useState({ busy: false, message: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  const loader = useCallback((signal: AbortSignal) => getNotifications(query, signal), [query])
  const resource = useAbortableResource(loader)
  const { reload } = resource
  useEffect(() => {
    if (!portalGateway.notifications) return
    const unsubscribe = portalGateway.notifications.subscribe?.(reload)
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reload()
    }, 60000)
    const visible = () => {
      if (document.visibilityState === 'visible') reload()
    }
    document.addEventListener('visibilitychange', visible)
    return () => {
      clearInterval(timer)
      unsubscribe?.()
      document.removeEventListener('visibilitychange', visible)
    }
  }, [reload])
  useEffect(() => () => controller.current?.abort(), [])
  const change = (patch: Partial<NotificationQuery>) =>
    setQuery((previous) => ({ ...previous, ...patch, page: patch.page ?? 1 }))
  const act = async (action: 'read' | 'clear' | 'simulate', id = 'ALL') => {
    if (lock.current) return
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, message: '' })
    try {
      if (action === 'simulate') await simulateNotification(controller.current.signal)
      else await updateNotifications(action, id, controller.current.signal)
      if (!controller.current.signal.aborted) {
        change({ page: 1 })
        setFeedback({
          busy: false,
          message:
            action === 'simulate'
              ? 'Aviso de teste gerado.'
              : action === 'read'
                ? 'Avisos marcados como lidos.'
                : 'Avisos lidos removidos.',
        })
        reload()
      }
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          message: error instanceof Error ? error.message : 'Não foi possível atualizar os avisos.',
        })
    } finally {
      lock.current = false
    }
  }
  return {
    ...resource,
    query,
    change,
    feedback,
    act,
    canRead: Boolean(portalGateway.notifications?.read),
    canClear: Boolean(portalGateway.notifications?.clearRead),
  }
}
