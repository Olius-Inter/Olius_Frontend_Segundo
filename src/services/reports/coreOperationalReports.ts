import type { AdminDashboardData, AdminFilters } from '../../types/admin-records/admin'
import type { AnalyticsGateway } from '../../types/reports/analytics'
import { get, integer, number, object, period } from '../core/coreData'

export async function operationalSummary(from: string, to: string, signal: AbortSignal) {
  const data = object(await get(`/api/v1/admin/environmental-summary?${period(from, to)}`, signal))
  const collections = object(data.collections)
  const summary = {
    count: integer(collections.count),
    successful: integer(collections.successful),
    unsuccessful: integer(collections.unsuccessful),
    liters: number(collections.collectedVolumeLiters),
    establishments: integer(collections.establishments),
  }
  if (summary.successful + summary.unsuccessful !== summary.count)
    throw new Error('Indicadores de coletas inconsistentes.')
  return summary
}
async function charts(
  from: string,
  to: string,
  signal: AbortSignal,
): Promise<AdminDashboardData['charts']> {
  const summary = await operationalSummary(from, to, signal)
  return [
    {
      id: 'collection-results',
      title: 'Resultado das visitas B2B no período',
      unit: 'count',
      values: [
        { id: 'successful', label: 'Bem-sucedidas', value: summary.successful },
        { id: 'unsuccessful', label: 'Malsucedidas', value: summary.unsuccessful },
      ],
    },
    {
      id: 'collection-liters',
      title: 'Volume recolhido B2B no período',
      unit: 'L',
      values: [{ id: 'collected', label: 'Recolhido', value: summary.liters }],
    },
  ]
}
export function createCoreAnalyticsGateway(): AnalyticsGateway {
  return {
    reports: async (query, signal) => ({
      period: query,
      generatedAt: new Date().toISOString(),
      complete: true,
      charts: await charts(query.from, query.to, signal),
    }),
  }
}
export async function coreDashboard(
  filters: AdminFilters,
  signal: AbortSignal,
): Promise<AdminDashboardData> {
  const summary = await operationalSummary(filters.from, filters.to, signal)
  return {
    metrics: [
      {
        id: 'visits',
        label: 'Visitas B2B no período',
        value: summary.count,
        unit: 'count',
        href: '/operacao/historico',
      },
      {
        id: 'liters',
        label: 'Litros recolhidos no período',
        value: summary.liters,
        unit: 'L',
        href: '/operacao/historico',
      },
      {
        id: 'establishments',
        label: 'Empresas atendidas no período',
        value: summary.establishments,
        unit: 'count',
        href: '/operacao/historico',
      },
    ],
    charts: [
      {
        id: 'collection-results',
        title: 'Resultados B2B no período',
        unit: 'count',
        values: [
          { id: 'successful', label: 'Bem-sucedidas', value: summary.successful },
          { id: 'unsuccessful', label: 'Malsucedidas', value: summary.unsuccessful },
        ],
      },
      {
        id: 'collection-liters',
        title: 'Volume recolhido B2B no período',
        unit: 'L',
        values: [{ id: 'collected', label: 'Recolhido', value: summary.liters }],
      },
    ],
  }
}
