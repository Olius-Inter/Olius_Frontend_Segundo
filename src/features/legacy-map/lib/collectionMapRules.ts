import type { MapCollector, MapCoordinates, MapQuery } from '../types/collectionMap'

export const collectorEnabled = (collector: MapCollector | null): boolean =>
  collector?.status === 'APPROVED' && collector.active
export function validCoordinates(value: unknown): value is MapCoordinates {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('latitude' in value) ||
    !('longitude' in value)
  )
    return false
  return (
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180
  )
}
export function validMapQuery(query: MapQuery): boolean {
  const origin =
    (query.latitude === null && query.longitude === null) ||
    validCoordinates({ latitude: query.latitude, longitude: query.longitude })
  return (
    origin &&
    typeof query.search === 'string' &&
    query.search.length <= 120 &&
    !/[\u0000-\u001f\u007f]/.test(query.search) &&
    [5, 10, 25, 50].includes(query.radiusKm) &&
    typeof query.openNow === 'boolean' &&
    typeof query.withSeal === 'boolean' &&
    ['ALL', 'PEV', 'ESTABLISHMENT'].includes(query.type) &&
    Number.isSafeInteger(query.page) &&
    query.page >= 1 &&
    query.page <= 100000 &&
    query.pageSize === 10
  )
}
export const sanitizeMapSearch = (value: string): string =>
  value
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .slice(0, 120)
    .trim()
export function pointRoute(coordinates: MapCoordinates): string {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('destination', `${coordinates.latitude},${coordinates.longitude}`)
  return url.toString()
}
