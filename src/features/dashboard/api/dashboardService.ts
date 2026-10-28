import type { AdminDashboardData, AdminFilters } from '../../admin-records/contracts'
import type { AdminResult } from '../../../shared/types/result'
import { adminGateway } from '../../admin-records/api'
import { validateAdminFilters } from '../../admin-records'

export async function getAdminDashboard(
  filters: AdminFilters,
  signal: AbortSignal,
): Promise<AdminResult<AdminDashboardData>> {
  try {
    signal.throwIfAborted()
    if (!validateAdminFilters(filters)) throw new Error('Confira o período.')
    if (!adminGateway.dashboard) return pending
    const data = await adminGateway.dashboard(filters, signal)
    if (
      !data ||
      !Array.isArray(data.metrics) ||
      !Array.isArray(data.charts) ||
      data.metrics.some(
        (item) => !item || typeof item.id !== 'string' || !['count', 'L'].includes(item.unit),
      ) ||
      data.charts.some(
        (chart) =>
          !chart ||
          typeof chart.id !== 'string' ||
          typeof chart.title !== 'string' ||
          !Array.isArray(chart.values) ||
          !['count', 'L'].includes(chart.unit) ||
          chart.values.some(
            (item) => !item || typeof item.id !== 'string' || typeof item.label !== 'string',
          ),
      )
    )
      throw new Error('Os indicadores recebidos são inválidos.')
    if (
      data.metrics.some(
        (item) => item.value !== null && (!Number.isFinite(item.value) || item.value < 0),
      ) ||
      data.charts.some((chart) =>
        chart.values.some((item) => !Number.isFinite(item.value) || item.value < 0),
      )
    )
      throw new Error('Os indicadores recebidos são inválidos.')
    return { kind: 'ready', data }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Não foi possível carregar os indicadores.')
  }
}
const pending = {
  kind: 'unavailable' as const,
  message: 'Esta consulta ainda não está disponível.',
}
