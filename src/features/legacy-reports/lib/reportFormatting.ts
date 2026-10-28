import type { ReportData, ReportSummary } from '../types/reports'

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const priceFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatLiters = (value: number): string => numberFormat.format(value)
export const formatMoney = (cents: number): string => priceFormat.format(cents / 100)
export const formatPercent = (value: number): string => numberFormat.format(value)

export function summarizeReport(data: ReportData): ReportSummary {
  const latest = data.collection.at(-1) ?? null
  const previous = data.previousPeriodLiters
  return {
    latest,
    totalLiters: data.collection.reduce((sum, point) => sum + point.liters, 0),
    growthPercent:
      latest && previous !== null && previous > 0
        ? ((latest.liters - previous) / previous) * 100
        : null,
  }
}

export const destinationColors = ['#ffc400', '#43ba60', '#ff8918', '#58a8e9', '#9468ce', '#d9779b']
