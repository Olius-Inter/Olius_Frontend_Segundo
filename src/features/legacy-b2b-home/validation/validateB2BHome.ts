import type { B2BHomeData, B2BOffer, B2BOffersPage } from '../types/b2bHome'

type ObjectValue = Record<string, unknown>
const object = (value: unknown): value is ObjectValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown, max = 150): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(value)
const volume = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e12
const nullableVolume = (value: unknown): boolean => value === null || volume(value)
const date = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value))
const nullableDate = (value: unknown): boolean => value === null || date(value)
const unique = (items: unknown[]): boolean =>
  new Set(items.map((item) => (object(item) ? item.id : undefined))).size === items.length
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

export function validateB2BHome(value: unknown): value is B2BHomeData {
  if (!object(value)) return false
  const { user, establishment, impact, oilStock, collector, sustainability, requests } = value
  if (
    !object(user) ||
    !text(user.id, 80) ||
    !text(user.name) ||
    user.accountType !== 'B2B' ||
    typeof user.active !== 'boolean'
  )
    return false
  if (!object(establishment) || !text(establishment.id, 80) || !text(establishment.name))
    return false
  if (
    !text(value.periodLabel, 80) ||
    typeof value.canRegisterOil !== 'boolean' ||
    !count(value.requestCount)
  )
    return false
  if (
    !object(impact) ||
    !['collectedLiters', 'preservedWaterLiters', 'avoidedCo2Kg', 'confirmedBiodieselLiters'].every(
      (key) => nullableVolume(impact[key]),
    )
  )
    return false
  if (
    !object(oilStock) ||
    !['storedLiters', 'reservedLiters', 'availableLiters', 'minimumCollectionLiters'].every((key) =>
      nullableVolume(oilStock[key]),
    ) ||
    typeof oilStock.canRequestCollection !== 'boolean' ||
    !(oilStock.blockedReason === null || text(oilStock.blockedReason, 300))
  )
    return false
  if (collector !== null) {
    if (
      !object(collector) ||
      !text(collector.id, 80) ||
      !text(collector.establishmentId, 80) ||
      collector.kind !== 'ESTABLISHMENT' ||
      !['PENDING', 'APPROVED', 'INACTIVE', 'REJECTED'].includes(String(collector.status)) ||
      typeof collector.active !== 'boolean' ||
      typeof collector.canViewOffers !== 'boolean' ||
      typeof collector.canAcceptOffers !== 'boolean' ||
      !nullableDate(collector.validFrom) ||
      !nullableDate(collector.validUntil)
    )
      return false
    if (
      collector.validFrom !== null &&
      collector.validUntil !== null &&
      Date.parse(String(collector.validUntil)) <= Date.parse(String(collector.validFrom))
    )
      return false
  }
  if (
    sustainability !== null &&
    (!object(sustainability) ||
      !text(sustainability.levelLabel, 80) ||
      !volume(sustainability.progressLiters) ||
      !volume(sustainability.nextLevelLiters) ||
      sustainability.nextLevelLiters <= 0)
  )
    return false
  if (
    !Array.isArray(requests) ||
    requests.length > 100 ||
    !requests.every(
      (item) =>
        object(item) &&
        text(item.id, 80) &&
        volume(item.estimatedLiters) &&
        date(item.createdAt) &&
        [
          'PENDING',
          'APPROVED',
          'ASSIGNED',
          'ARRIVED',
          'COLLECTED',
          'REJECTED',
          'CANCELLED',
        ].includes(String(item.status)),
    ) ||
    !unique(requests)
  )
    return false
  return value.requestCount >= requests.length
}

function isOffer(value: unknown): value is B2BOffer {
  return (
    object(value) &&
    text(value.id, 80) &&
    text(value.establishmentName) &&
    text(value.regionLabel) &&
    volume(value.estimatedLiters) &&
    date(value.windowStart) &&
    date(value.windowEnd) &&
    Date.parse(value.windowEnd) > Date.parse(value.windowStart) &&
    nullableDate(value.expiresAt)
  )
}

export function validateB2BOffers(value: unknown): value is B2BOffersPage {
  return (
    object(value) &&
    Array.isArray(value.items) &&
    value.items.length <= 100 &&
    value.items.every(isOffer) &&
    unique(value.items) &&
    count(value.total) &&
    value.total >= value.items.length
  )
}
