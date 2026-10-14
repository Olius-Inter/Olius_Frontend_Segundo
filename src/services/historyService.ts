import type { HistoryQuery, HistoryResponse } from '../types/history'
import { validHistoryQuery } from '../utils/historyRules'
import { validateHistory } from '../utils/validateHistory'

export async function getHistory(
  query: HistoryQuery,
  signal: AbortSignal,
): Promise<HistoryResponse> {
  try {
    signal.throwIfAborted()
    if (!validHistoryQuery(query)) throw new Error('Selecione um período e uma página válidos.')
    const endpoint = import.meta.env.VITE_HISTORY_API_URL as string | undefined
    if (!endpoint) return { kind: 'not-configured' }
    const url = new URL(endpoint, window.location.origin)
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value))
    const response = await fetch(url, {
      signal,
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (response.status === 401) return { kind: 'unauthenticated' }
    if (response.status === 403) return { kind: 'forbidden' }
    if (!response.ok) throw new Error('Não foi possível carregar o histórico. Tente novamente.')
    const payload: unknown = await response.json()
    if (!validateHistory(payload, query))
      throw new Error(
        'O histórico recebido não corresponde ao período, às permissões ou ao contrato esperado. Atualize os filtros e tente novamente.',
      )
    return { kind: 'ready', data: payload }
  } catch (error: unknown) {
    if (signal.aborted) throw error
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao Olius. Confira sua conexão.', { cause: error })
    if (error instanceof SyntaxError)
      throw new Error('O histórico recebido está em um formato inválido.', { cause: error })
    throw error instanceof Error
      ? error
      : new Error('Não foi possível consultar o histórico.', { cause: error })
  }
}
