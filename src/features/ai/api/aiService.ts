import type { AIRequest, AIResponse } from '../types/ai'
import { validateAIMessage, validateAIResponse } from '../validation/aiValidation'

export const aiConfigured = Boolean(import.meta.env.VITE_AI_API_URL?.trim())

export async function sendAIMessage(input: AIRequest, signal: AbortSignal): Promise<AIResponse> {
  try {
    signal.throwIfAborted()
    const invalid = validateAIMessage(input.message)
    if (invalid) throw new Error(invalid)
    const endpoint = import.meta.env.VITE_AI_API_URL as string | undefined
    if (!endpoint?.trim()) throw new Error('A integração com a IA ainda não está disponível.')
    const response = await fetch(endpoint, {
      method: 'POST',
      signal,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': input.requestId,
      },
      body: JSON.stringify(input),
    })
    if (response.status === 401)
      throw new Error('Sua sessão expirou. Entre novamente para continuar.')
    if (response.status === 403) throw new Error('Sua conta não tem acesso ao assistente.')
    if (response.status === 429)
      throw new Error('O limite de consultas foi atingido. Tente novamente mais tarde.')
    if (!response.ok) throw new Error('Não foi possível consultar o assistente. Tente novamente.')
    const payload: unknown = await response.json()
    if (!validateAIResponse(payload))
      throw new Error('A resposta recebida está em um formato incompatível.')
    return payload
  } catch (error: unknown) {
    if (signal.aborted) throw error
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao assistente.', { cause: error })
    if (error instanceof SyntaxError)
      throw new Error('O assistente retornou uma resposta inválida.', { cause: error })
    throw error instanceof Error
      ? error
      : new Error('Não foi possível enviar a pergunta.', { cause: error })
  }
}
