import type { RankingData, RankingEntry, RankingQuery } from '../types/ranking'

type ObjectValue = Record<string, unknown>
const object = (value: unknown): value is ObjectValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 500
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const liters = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
const date = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value))
function entry(value: unknown): value is RankingEntry {
  return (
    object(value) &&
    text(value.establishmentId) &&
    text(value.name) &&
    text(value.city) &&
    count(value.rank) &&
    value.rank > 0 &&
    liters(value.confirmedLiters)
  )
}
function entries(value: unknown): value is RankingEntry[] {
  if (
    !Array.isArray(value) ||
    !value.every(entry) ||
    new Set(value.map((item) => item.establishmentId)).size !== value.length
  )
    return false
  return value.every(
    (item, index) =>
      index === 0 ||
      (item.rank >= value[index - 1].rank &&
        item.confirmedLiters <= value[index - 1].confirmedLiters),
  )
}
export function validateRanking(value: unknown, query: RankingQuery): value is RankingData {
  if (
    !object(value) ||
    value.accountType !== 'B2B' ||
    !object(value.establishment) ||
    !text(value.establishment.id) ||
    !text(value.establishment.name) ||
    !object(value.query) ||
    !Object.entries(query).every(
      ([key, item]) => object(value.query) && value.query[key] === item,
    ) ||
    !text(value.periodLabel) ||
    !text(value.criteria) ||
    !entries(value.podium) ||
    !entries(value.items) ||
    !count(value.total) ||
    !count(value.totalPages) ||
    value.totalPages !== Math.ceil(value.total / query.pageSize) ||
    query.page > Math.max(1, value.totalPages) ||
    value.items.length !==
      Math.min(query.pageSize, Math.max(0, value.total - (query.page - 1) * query.pageSize)) ||
    value.podium.length !== Math.min(3, value.total)
  )
    return false
  if (
    value.ownPosition !== null &&
    (!object(value.ownPosition) ||
      (value.ownPosition.rank !== null &&
        (!count(value.ownPosition.rank) ||
          value.ownPosition.rank < 1 ||
          value.ownPosition.rank > value.total)) ||
      (value.ownPosition.confirmedLiters !== null && !liters(value.ownPosition.confirmedLiters)))
  )
    return false
  const { items, podium, total } = value
  if (!items.every((item) => item.rank <= total) || !podium.every((item) => item.rank <= total))
    return false
  if (
    query.page === 1 &&
    !podium.every((item, index) => items[index]?.establishmentId === item.establishmentId)
  )
    return false
  const own = [...value.podium, ...value.items].find(
    (item) =>
      item.establishmentId === (object(value.establishment) ? value.establishment.id : undefined),
  )
  if (
    own &&
    (!object(value.ownPosition) ||
      value.ownPosition.rank !== own.rank ||
      value.ownPosition.confirmedLiters !== own.confirmedLiters)
  )
    return false
  for (const item of value.podium) {
    const match = value.items.find((row) => row.establishmentId === item.establishmentId)
    if (
      match &&
      (item.rank !== match.rank ||
        item.confirmedLiters !== match.confirmedLiters ||
        item.name !== match.name ||
        item.city !== match.city)
    )
      return false
  }
  if (
    value.achievements !== null &&
    (!Array.isArray(value.achievements) ||
      value.achievements.length > 100 ||
      !value.achievements.every(
        (item) =>
          object(item) &&
          text(item.id) &&
          text(item.title) &&
          text(item.description) &&
          date(item.earnedAt),
      ) ||
      new Set(value.achievements.map((item) => item.id)).size !== value.achievements.length)
  )
    return false
  return true
}
