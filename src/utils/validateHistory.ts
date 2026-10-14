import type { HistoryData, HistoryQuery, HistoryRecord } from '../types/history'
import { historyVisualStatus } from './historyRules'

type ObjectValue = Record<string, unknown>
const object = (value: unknown): value is ObjectValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 250
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const volume = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0)
function record(value: unknown, query: HistoryQuery): value is HistoryRecord {
  if (
    !object(value) ||
    !text(value.id) ||
    typeof value.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.date) ||
    !Number.isFinite(Date.parse(value.date)) ||
    ![
      'REGISTERED',
      'PENDING',
      'APPROVED',
      'ASSIGNED',
      'ARRIVED',
      'COLLECTED',
      'PROCESSED',
    ].includes(String(value.status)) ||
    !volume(value.estimatedLiters) ||
    !volume(value.confirmedLiters)
  )
    return false
  const item = value as unknown as HistoryRecord
  if ((item.status === 'COLLECTED' || item.status === 'PROCESSED') && item.confirmedLiters === null)
    return false
  if (!['COLLECTED', 'PROCESSED'].includes(item.status) && item.confirmedLiters !== null)
    return false
  const date = new Date(item.date)
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(date)
  return (
    Number(parts.find((part) => part.type === 'month')?.value) === query.month &&
    Number(parts.find((part) => part.type === 'year')?.value) === query.year &&
    (query.status === 'ALL' || historyVisualStatus(item.status) === query.status)
  )
}
export function validateHistory(value: unknown, query: HistoryQuery): value is HistoryData {
  if (
    !object(value) ||
    !object(value.establishment) ||
    !text(value.establishment.id) ||
    !text(value.establishment.name) ||
    !Array.isArray(value.allowedScopes) ||
    !value.allowedScopes.includes('own') ||
    !value.allowedScopes.includes(query.scope) ||
    !value.allowedScopes.every((scope) => scope === 'own' || scope === 'collections') ||
    new Set(value.allowedScopes).size !== value.allowedScopes.length ||
    !object(value.query) ||
    !Object.entries(query).every(
      ([key, entry]) => value.query && object(value.query) && value.query[key] === entry,
    ) ||
    !Array.isArray(value.items) ||
    !value.items.every((item) => record(item, query)) ||
    new Set(value.items.map((item) => item.id)).size !== value.items.length ||
    !count(value.total) ||
    !count(value.periodTotal) ||
    value.periodTotal < value.total ||
    !count(value.totalPages) ||
    value.totalPages !== Math.ceil(value.total / query.pageSize) ||
    query.page > Math.max(1, value.totalPages) ||
    value.items.length !==
      Math.min(query.pageSize, Math.max(0, value.total - (query.page - 1) * query.pageSize)) ||
    !object(value.impact) ||
    !['collectedLiters', 'preservedWaterLiters', 'avoidedCo2Kg', 'confirmedBiodieselLiters'].every(
      (key) => object(value.impact) && volume(value.impact[key]),
    )
  )
    return false
  return true
}
