import type { AIResponse } from '../types/ai'

export function sanitizeAIMessage(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
}

export function validateAIMessage(value: string): string | null {
  const message = sanitizeAIMessage(value)
  if (!message) return 'Digite uma pergunta para continuar.'
  if (message.length > 2000) return 'A pergunta deve ter no máximo 2.000 caracteres.'
  return null
}

export function validateAIResponse(value: unknown): value is AIResponse {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('conversationId' in value) ||
    !('message' in value)
  )
    return false
  const message = value.message
  return (
    typeof value.conversationId === 'string' &&
    value.conversationId.trim().length > 0 &&
    value.conversationId.length <= 200 &&
    typeof message === 'object' &&
    message !== null &&
    'id' in message &&
    'role' in message &&
    'content' in message &&
    typeof message.id === 'string' &&
    message.id.trim().length > 0 &&
    message.id.length <= 200 &&
    message.role === 'assistant' &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= 20000
  )
}
