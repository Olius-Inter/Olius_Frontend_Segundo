import type { CollectionMapResponse, MapQuery } from '../types/collectionMap'
import { validMapQuery } from '../lib/collectionMapRules'
import { validateCollectionMap } from '../validation/validateCollectionMap'

export async function getCollectionMap(
  query: MapQuery,
  signal: AbortSignal,
): Promise<CollectionMapResponse> {
  try {
    signal.throwIfAborted()
    if (!validMapQuery(query)) throw new Error('Informe filtros e localização válidos.')
    const endpoint = import.meta.env.VITE_COLLECTION_MAP_API_URL as string | undefined
    if (!endpoint) return { kind: 'not-configured' }
    const url = new URL(endpoint, window.location.origin)
    for (const [key, value] of Object.entries(query))
      if (value !== null) url.searchParams.set(key, String(value))
    const response = await fetch(url, {
      signal,
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (response.status === 401) return { kind: 'unauthenticated' }
    if (response.status === 403) return { kind: 'forbidden' }
    if (!response.ok)
      throw new Error('Não foi possível consultar os pontos de coleta. Tente novamente.')
    const payload: unknown = await response.json()
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'accountType' in payload &&
      payload.accountType !== 'B2B'
    )
      return { kind: 'forbidden' }
    if (!validateCollectionMap(payload, query))
      throw new Error('Os pontos ou as permissões recebidos não correspondem ao contrato esperado.')
    return { kind: 'ready', data: payload }
  } catch (error: unknown) {
    if (signal.aborted) throw error
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao Olius. Confira sua conexão.', { cause: error })
    if (error instanceof SyntaxError)
      throw new Error('Os dados do mapa estão em um formato inválido.', { cause: error })
    throw error instanceof Error
      ? error
      : new Error('Não foi possível carregar o mapa.', { cause: error })
  }
}
