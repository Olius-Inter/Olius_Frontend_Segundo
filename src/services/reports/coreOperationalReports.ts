import type { AdminDashboardData, AdminFilters } from '../../types/admin-records/admin'
import type { AnalyticsGateway } from '../../types/reports/analytics'
import { allPages, date, get, integer, number, object, page, period, state } from '../core/coreData'
import { brasiliaDate } from '../../utils/date'
import { request, requestsPath } from '../admin-records/coreRequestsResource'

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
  const today = brasiliaDate()
  const from = filters.from || `${today.slice(0, 7)}-01`
  const to = filters.to || today
  const collectionQuery = period(from, to)
  collectionQuery.set('recordStatus', 'RECORDED')
  const [pending, approved, collections] = await Promise.all([
    page(requestsPath, new URLSearchParams({ status: 'PENDING' }), 0, 1, signal),
    allPages(requestsPath, new URLSearchParams({ status: 'APPROVED' }), signal),
    allPages('/api/v1/admin/collections', collectionQuery, signal),
  ])
  const visits = approved.map(request).filter((row) => row.collectionId === null && row.scheduledAt)
  if (visits.some((row) => row.status !== 'APPROVED'))
    throw new Error('A consulta retornou visitas fora da situação selecionada.')
  const start = Date.parse(`${from}T00:00:00-03:00`)
  const end = Date.parse(`${to}T00:00:00-03:00`)
  const days = Math.floor((end - start) / 86400000) + 1
  if (!Number.isSafeInteger(days) || days < 1)
    throw new Error('Período inválido para os indicadores.')
  const bins = Math.min(6, days)
  const summaries = Array.from({ length: bins }, (_, index) => {
    const firstDay = Math.floor((index * days) / bins)
    const nextDay = Math.floor(((index + 1) * days) / bins)
    const id = brasiliaDate(new Date(start + firstDay * 86400000))
    return {
      id,
      label: id.slice(8, 10) + '/' + id.slice(5, 7),
      firstDay,
      nextDay,
      cents: 0,
      count: 0,
    }
  })
  for (const row of collections) {
    if (state(row.recordStatus, ['RECORDED', 'ANNULLED']) !== 'RECORDED')
      throw new Error('A consulta retornou coletas fora da situação selecionada.')
    const collectedAt = date(row.collectionDate)
    const day = Math.floor(
      (Date.parse(`${brasiliaDate(collectedAt)}T00:00:00-03:00`) - start) / 86400000,
    )
    const bin = summaries.find((item) => day >= item.firstDay && day < item.nextDay)
    if (!bin) throw new Error('A consulta retornou coletas fora do período selecionado.')
    bin.cents += Math.round(number(row.collectedVolumeLiters) * 100)
    bin.count++
  }
  return {
    metrics: [
      {
        id: 'pending',
        label: 'Solicitações pendentes',
        value: pending.total,
        unit: 'count',
        href: '/operacao/solicitacoes?status=PENDING',
      },
      {
        id: 'today',
        label: 'Visitas agendadas hoje',
        value: visits.filter((row) => brasiliaDate(row.scheduledAt!) === today).length,
        unit: 'count',
        href: '/operacao/agenda',
      },
      {
        id: 'remaining',
        label: 'Visitas restantes no mês',
        value: visits.filter(
          (row) =>
            brasiliaDate(row.scheduledAt!) >= today &&
            brasiliaDate(row.scheduledAt!).startsWith(today.slice(0, 7)),
        ).length,
        unit: 'count',
        href: '/operacao/agenda',
      },
    ],
    charts: [
      {
        id: 'liters',
        title: 'Evolução dos litros efetivamente recolhidos',
        unit: 'L',
        values: summaries.map((row) => ({ id: row.id, label: row.label, value: row.cents / 100 })),
      },
      {
        id: 'collections',
        title: 'Coletas ao longo do tempo',
        unit: 'count',
        values: summaries.map((row) => ({ id: row.id, label: row.label, value: row.count })),
      },
    ],
  }
}
