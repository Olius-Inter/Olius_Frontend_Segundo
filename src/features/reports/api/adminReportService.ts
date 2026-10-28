import type { AdminResult } from '../../../shared/types/result'
import type { AnalyticsQuery, AnalyticsReport } from '../types/analytics'
import { analyticsGateway } from './analyticsGateway'
import { validDate } from '../../../shared/lib/validDate'

export async function getAdminReports(
  query: AnalyticsQuery,
  signal: AbortSignal,
): Promise<AdminResult<AnalyticsReport>> {
  try {
    signal.throwIfAborted()
    if (!validDate(query.from) || !validDate(query.to) || query.from > query.to)
      throw new Error('Selecione um período válido.')
    if (!analyticsGateway.reports)
      return {
        kind: 'unavailable',
        message: 'Os relatórios estarão disponíveis após a conexão com a fonte analítica.',
      }
    const data = await analyticsGateway.reports(query, signal)
    if (
      !data ||
      data.period?.from !== query.from ||
      data.period?.to !== query.to ||
      !Number.isFinite(Date.parse(data.generatedAt)) ||
      typeof data.complete !== 'boolean' ||
      !Array.isArray(data.charts) ||
      new Set(data.charts.map((chart) => chart?.id)).size !== data.charts.length ||
      data.charts.some(
        (chart) =>
          !chart ||
          typeof chart.id !== 'string' ||
          typeof chart.title !== 'string' ||
          !['L', 'count'].includes(chart.unit) ||
          !Array.isArray(chart.values) ||
          new Set(chart.values.map((value) => value?.id)).size !== chart.values.length ||
          chart.values.some(
            (value) =>
              !value ||
              typeof value.id !== 'string' ||
              typeof value.label !== 'string' ||
              !Number.isFinite(value.value) ||
              value.value < 0,
          ),
      )
    )
      throw new Error(
        'O relatório analítico recebido é inválido ou não corresponde ao período solicitado.',
      )
    return { kind: 'ready', data }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível carregar os relatórios.')
  }
}
