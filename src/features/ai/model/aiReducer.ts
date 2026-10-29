import type { AIAction, AIState } from '../types/ai'

export const initialAIState: AIState = { phase: 'idle', messages: [], conversationId: null }

export function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'send':
      return state.phase === 'pending'
        ? state
        : {
            phase: 'pending',
            messages: state.messages,
            conversationId: state.conversationId,
            request: action.request,
          }
    case 'success':
      if (state.phase !== 'pending' || state.request.requestId !== action.requestId) return state
      return {
        phase: 'idle',
        conversationId: action.response.conversationId,
        messages: [
          ...state.messages,
          { id: `user:${action.requestId}`, role: 'user', content: state.request.message },
          {
            id: `assistant:${action.response.message.id}`,
            role: 'assistant',
            content: action.response.message.content,
          },
        ],
      }
    case 'error':
      return {
        phase: 'error',
        messages: state.messages,
        conversationId: state.conversationId,
        error: action.message,
      }
    case 'cancel':
      return { phase: 'idle', messages: state.messages, conversationId: state.conversationId }
    case 'reset':
      return initialAIState
  }
}
