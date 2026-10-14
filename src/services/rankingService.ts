import type { RankingQuery, RankingResponse } from '../types/ranking'
import { validRankingQuery } from '../utils/rankingRules'
import { validateRanking } from '../utils/validateRanking'

export async function getRanking(
  query: RankingQuery,
  signal: AbortSignal,
): Promise<RankingResponse> {
  try {
    signal.throwIfAborted()
    if (!validRankingQuery(query)) throw new Error('Selecione um período e uma página válidos.')
    const endpoint = import.meta.env.VITE_RANKING_API_URL as string | undefined
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
    if (!response.ok) throw new Error('Não foi possível carregar o ranking. Tente novamente.')
    const payload: unknown = await response.json()
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'accountType' in payload &&
      payload.accountType !== 'B2B'
    )
      return { kind: 'forbidden' }
    if (!validateRanking(payload, query))
      throw new Error(
        'O ranking recebido não corresponde ao período ou ao contrato de estabelecimentos esperado.',
      )
    return { kind: 'ready', data: payload }
  } catch (error: unknown) {
    if (signal.aborted) throw error
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao Olius. Confira sua conexão.', { cause: error })
    if (error instanceof SyntaxError)
      throw new Error('O ranking recebido está em um formato inválido.', { cause: error })
    throw error instanceof Error
      ? error
      : new Error('Não foi possível consultar o ranking.', { cause: error })
  }
}
