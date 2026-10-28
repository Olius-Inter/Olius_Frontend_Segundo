import { useEffect, useRef, useState } from 'react'
import { sendAssistantMessage } from '../api/assistantService'
import type { AssistantMessage } from '../types/assistant'
export function useAssistant() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(
    () => () => {
      controller.current?.abort()
    },
    [],
  )
  function selectQuestion(question: string) {
    setMessage(question)
    setFeedback('')
    inputRef.current?.focus()
  }
  async function send() {
    if (controller.current) return
    const request = new AbortController()
    controller.current = request
    setBusy(true)
    setFeedback('')
    try {
      const reply = await sendAssistantMessage({ message }, request.signal)
      if (request.signal.aborted) return
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: 'user', text: message.trim() },
        { id: crypto.randomUUID(), role: 'assistant', text: reply.text },
      ])
      setMessage('')
      inputRef.current?.focus()
    } catch (error: unknown) {
      if (!request.signal.aborted)
        setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.')
    } finally {
      if (controller.current === request) controller.current = null
      if (!request.signal.aborted) setBusy(false)
    }
  }
  return { message, setMessage, messages, busy, feedback, inputRef, selectQuestion, send }
}
