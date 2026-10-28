import type { CollectionMapData, CollectionPoint, MapQuery } from '../types/collectionMap'
import { validCoordinates } from '../lib/collectionMapRules'

type ObjectValue = Record<string, unknown>
const object = (value: unknown): value is ObjectValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 500
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
function point(value: unknown): value is CollectionPoint {
  return (
    object(value) &&
    text(value.id) &&
    (value.ownerEstablishmentId === null || text(value.ownerEstablishmentId)) &&
    text(value.name) &&
    text(value.address) &&
    validCoordinates(value.coordinates) &&
    ['PEV', 'ESTABLISHMENT'].includes(String(value.type)) &&
    value.active === true &&
    value.approvalStatus === 'APPROVED' &&
    value.covered === true &&
    (value.scheduleLabel === null || text(value.scheduleLabel)) &&
    (value.openNow === null || typeof value.openNow === 'boolean') &&
    (value.distanceMeters === null ||
      (typeof value.distanceMeters === 'number' &&
        Number.isFinite(value.distanceMeters) &&
        value.distanceMeters >= 0)) &&
    [null, 'BRONZE', 'SILVER', 'GOLD'].includes(value.seal as string | null) &&
    typeof value.sponsored === 'boolean' &&
    ['POINT', 'PERSON'].includes(String(value.marker))
  )
}
export function validateCollectionMap(value: unknown, query: MapQuery): value is CollectionMapData {
  if (
    !object(value) ||
    value.accountType !== 'B2B' ||
    !text(value.establishmentId) ||
    !object(value.query) ||
    !Object.entries(query).every(
      ([key, item]) => object(value.query) && value.query[key] === item,
    ) ||
    (value.center !== null && !validCoordinates(value.center)) ||
    !['COVERED', 'OUTSIDE', 'UNKNOWN'].includes(String(value.coverage)) ||
    !Array.isArray(value.items) ||
    !value.items.every(point) ||
    new Set(value.items.map((item) => item.id)).size !== value.items.length ||
    !count(value.total) ||
    !count(value.totalPages) ||
    value.totalPages !== Math.ceil(value.total / query.pageSize) ||
    query.page > Math.max(1, value.totalPages) ||
    value.items.length !==
      Math.min(query.pageSize, Math.max(0, value.total - (query.page - 1) * query.pageSize)) ||
    !object(value.collector)
  )
    return false
  const collector = value.collector
  if (
    !['NONE', 'PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'].includes(String(collector.status)) ||
    !['active', 'canApply', 'canViewRequests', 'canViewCollections'].every(
      (key) => typeof collector[key] === 'boolean',
    ) ||
    (collector.ownPoint !== null && !point(collector.ownPoint))
  )
    return false
  const enabled = collector.status === 'APPROVED' && collector.active === true
  if (
    !enabled &&
    (collector.active ||
      collector.canViewRequests ||
      collector.canViewCollections ||
      collector.ownPoint !== null)
  )
    return false
  if ((enabled || collector.status === 'PENDING') && collector.canApply) return false
  if (
    enabled &&
    (!point(collector.ownPoint) ||
      collector.ownPoint.marker !== 'PERSON' ||
      collector.ownPoint.ownerEstablishmentId !== value.establishmentId)
  )
    return false
  if (value.coverage !== 'COVERED' && value.total !== 0) return false
  if (value.coverage === 'COVERED' && value.center === null) return false
  return value.items.every(
    (item) =>
      (!query.openNow || item.openNow === true) &&
      (!query.withSeal || item.seal !== null) &&
      (query.type === 'ALL' || item.type === query.type) &&
      (item.distanceMeters === null || item.distanceMeters <= query.radiusKm * 1000),
  )
}
