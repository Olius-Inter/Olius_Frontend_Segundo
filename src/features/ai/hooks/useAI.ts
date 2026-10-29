import { useEffect, useReducer, useRef, useState } from 'react'
import { aiReducer, initialAIState } from '../model/aiReducer'
import { aiConfigured, sendAIMessage } from '../api/aiService'
import { sanitizeAIMessage, validateAIMessage } from '../validation/aiValidation'

export function useAI() {
  const [state, dispatch] = useReducer(aiReducer, initialAIState)
  const [draft, setDraft] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const send = async () => {
    if (controller.current) return
    const invalid = validateAIMessage(draft)
    if (invalid) {
      dispatch({ type: 'error', message: invalid })
      return
    }
    if (!aiConfigured) {
      dispatch({ type: 'error', message: 'A integração com a IA ainda não está disponível.' })
      return
    }
    if (state.messages.length >= 40) {
      dispatch({ type: 'error', message: 'Inicie uma nova conversa para continuar.' })
      return
    }
    const active = new AbortController()
    controller.current = active
    const request = {
      message: sanitizeAIMessage(draft),
      conversationId: state.conversationId,
      requestId: crypto.randomUUID(),
    }
    dispatch({ type: 'send', request })
    try {
      const response = await sendAIMessage(request, active.signal)
      if (active.signal.aborted) return
      if (
        (state.conversationId && state.conversationId !== response.conversationId) ||
        state.messages.some((message) => message.id === `assistant:${response.message.id}`)
      )
        throw new Error('A resposta recebida não corresponde à conversa atual.')
      dispatch({ type: 'success', requestId: request.requestId, response })
      setDraft('')
    } catch (error: unknown) {
      if (!active.signal.aborted)
        dispatch({
          type: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível consultar a IA.',
        })
    } finally {
      if (controller.current === active) controller.current = null
    }
  }

  const cancel = () => {
    controller.current?.abort()
    controller.current = null
    dispatch({ type: 'cancel' })
  }
  const reset = () => {
    cancel()
    setDraft('')
    dispatch({ type: 'reset' })
  }
  return { state, draft, setDraft, send, cancel, reset, configured: aiConfigured }
}
