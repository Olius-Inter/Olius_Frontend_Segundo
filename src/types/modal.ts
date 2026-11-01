import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  busy?: boolean
  children: ReactNode
}
