import type { AssistantGateway, AssistantInput, AssistantReply } from '../types/assistant'
const gateway: AssistantGateway = {}
export function configureAssistantGateway(adapter: AssistantGateway): void {
  Object.assign(gateway, adapter)
}
export async function sendAssistantMessage(
  input: AssistantInput,
  signal: AbortSignal,
): Promise<AssistantReply> {
  try {
    signal.throwIfAborted()
    if (!input.message.trim()) throw new Error('Escreva uma mensagem.')
    if (input.message.length > 4000) throw new Error('Use até 4.000 caracteres na mensagem.')
    if (!gateway.send)
      throw new Error(
        'O assistente ainda não está conectado. Sua mensagem não foi enviada. Tente novamente quando o serviço estiver disponível.',
      )
    const reply = await gateway.send({ message: input.message.trim() }, signal)
    if (
      !reply ||
      typeof reply.id !== 'string' ||
      !reply.id ||
      typeof reply.text !== 'string' ||
      !reply.text.trim()
    )
      throw new Error('O assistente retornou uma resposta inválida.')
    return reply
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível enviar a mensagem.')
  }
}
