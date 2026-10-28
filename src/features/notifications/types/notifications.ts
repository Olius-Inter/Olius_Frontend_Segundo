import type { CSSProperties } from 'react'

export type NotificationCategory = 'ALL' | 'REQUESTS' | 'AGENDA' | 'SYSTEM'

export interface PortalNotification {
  id: string
  title: string
  description: string
  date: string
  category: Exclude<NotificationCategory, 'ALL'>
  read: boolean
  href: string | null
}

export interface NotificationQuery {
  category: NotificationCategory
  unreadOnly: boolean
  page: number
  pageSize: number
}

export interface NotificationPage {
  items: PortalNotification[]
  total: number
  unreadTotal: number
  totalPages: number
}

export interface NotificationCardProps {
  compact?: boolean
  notification: PortalNotification
  busy: boolean
  canRead: boolean
  onRead: (id: string) => void
}
export interface NotificationsGateway {
  notifications?: {
    list: (query: NotificationQuery, signal: AbortSignal) => Promise<NotificationPage>
    read?: (id: string | 'ALL', signal: AbortSignal) => Promise<void>
    clearRead?: (signal: AbortSignal) => Promise<void>
    subscribe?: (onChange: () => void) => () => void
  }
}

export type NotificationPopoverPosition = Pick<
  CSSProperties,
  'top' | 'left' | 'width' | 'maxHeight'
>
