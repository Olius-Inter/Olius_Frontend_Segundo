import type { RefObject } from 'react'
export interface AssistantInput {
  message: string
}
export interface AssistantReply {
  id: string
  text: string
}
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}
export interface AssistantGateway {
  send?: (input: AssistantInput, signal: AbortSignal) => Promise<AssistantReply>
}
export interface AssistantComposerProps {
  message: string
  busy: boolean
  feedback: string
  inputRef: RefObject<HTMLTextAreaElement | null>
  onMessage: (value: string) => void
  onSend: () => void
}
export interface PromptSuggestionsProps {
  disabled: boolean
  onSelect: (question: string) => void
}
