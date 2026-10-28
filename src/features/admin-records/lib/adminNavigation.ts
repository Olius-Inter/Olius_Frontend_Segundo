import type { AdminArea, AdminResource } from '../types/admin'
import { adminTabs } from '../data/adminResources.ts'

export function resolveAdminArea(area: string | undefined): AdminArea | null {
  return area && ['operacao', 'administracao'].includes(area) && Object.hasOwn(adminTabs, area)
    ? (area as AdminArea)
    : null
}
export function resolveAdminResource(
  area: AdminArea,
  tab: string,
  search: URLSearchParams,
): AdminResource | null {
  if (area === 'operacao' && tab === 'historico') {
    const type = search.get('tipo')
    if (type === 'rejeitadas') return 'requests'
    return type ? null : 'collections'
  }
  if (area === 'comercial' && tab === 'financeiro')
    return search.get('tipo') === 'pagamentos'
      ? 'payments'
      : search.get('tipo') === 'reembolsos'
        ? 'refunds'
        : 'charges'
  return adminTabs[area].find((item) => item.slug === tab)?.resource ?? null
}
