export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface AIRequest {
  message: string
  conversationId: string | null
  requestId: string
}

export interface AIResponse {
  conversationId: string
  message: { id: string; role: 'assistant'; content: string }
}

export interface AIConversation {
  messages: AIMessage[]
  conversationId: string | null
}

export type AIState = AIConversation &
  ({ phase: 'idle' } | { phase: 'pending'; request: AIRequest } | { phase: 'error'; error: string })

export type AIAction =
  | { type: 'send'; request: AIRequest }
  | { type: 'success'; requestId: string; response: AIResponse }
  | { type: 'error'; message: string }
  | { type: 'cancel' }
  | { type: 'reset' }

export interface AIComposerProps {
  draft: string
  pending: boolean
  configured: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export interface AISuggestionsProps {
  disabled: boolean
  onSelect: (value: string) => void
}
export interface AIConversationProps {
  messages: AIMessage[]
  pending: boolean
}
export interface AIStatusProps {
  configured: boolean
  error: string | null
}
