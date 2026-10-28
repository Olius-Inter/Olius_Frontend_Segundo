import type { ReactNode } from 'react'

export interface PageHeadingProps {
  title: string
  description: string
}

export interface PageFeedbackProps {
  kind: 'loading' | 'empty' | 'error' | 'not-found'
  title: string
  description: string
  label?: string
  headingLevel?: 'h1' | 'h2'
  children?: ReactNode
}
