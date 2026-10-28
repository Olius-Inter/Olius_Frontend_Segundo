import type { PlanId, ReportData, ReportPeriod, ReportPreferences } from '../types/reports'

export function isReportPeriod(value: unknown): value is ReportPeriod {
  return value === 'monthly' || value === 'yearly'
}

export function validateReportPreferences(value: unknown): value is ReportPreferences {
  if (typeof value !== 'object' || value === null) return false
  const input = value as Record<string, unknown>
  return (
    isReportPeriod(input.period) &&
    typeof input.year === 'number' &&
    Number.isInteger(input.year) &&
    input.year >= 2000 &&
    input.year <= new Date().getFullYear()
  )
}

export function validatePlanId(value: unknown): value is PlanId {
  return value === 'basic' || value === 'professional' || value === 'business'
}

function isPoint(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const point = value as Record<string, unknown>
  return (
    typeof point.id === 'string' &&
    point.id.trim().length > 0 &&
    point.id.length <= 80 &&
    typeof point.label === 'string' &&
    point.label.trim().length > 0 &&
    point.label.length <= 120 &&
    typeof point.liters === 'number' &&
    Number.isFinite(point.liters) &&
    point.liters >= 0 &&
    point.liters <= 1e12
  )
}

function hasUniqueIds(points: unknown[]): boolean {
  return (
    new Set(points.map((point) => (point as Record<string, unknown>).id)).size === points.length
  )
}

export function validateReportData(value: unknown): value is Omit<ReportData, 'source'> {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Record<string, unknown>
  return (
    Array.isArray(report.collection) &&
    report.collection.length <= 24 &&
    report.collection.every(isPoint) &&
    hasUniqueIds(report.collection) &&
    Array.isArray(report.destinations) &&
    report.destinations.length <= 12 &&
    report.destinations.every(isPoint) &&
    hasUniqueIds(report.destinations) &&
    (report.previousPeriodLiters === null ||
      (typeof report.previousPeriodLiters === 'number' &&
        Number.isFinite(report.previousPeriodLiters) &&
        report.previousPeriodLiters >= 0 &&
        report.previousPeriodLiters <= 1e12))
  )
}

export function sanitizeReportData(data: Omit<ReportData, 'source'>): Omit<ReportData, 'source'> {
  const label = (value: string) =>
    value
      .normalize('NFC')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
  return {
    collection: data.collection.map((point) => ({
      id: point.id,
      label: label(point.label),
      liters: point.liters,
    })),
    destinations: data.destinations.map((point) => ({
      id: point.id,
      label: label(point.label),
      liters: point.liters,
    })),
    previousPeriodLiters: data.previousPeriodLiters,
  }
}
