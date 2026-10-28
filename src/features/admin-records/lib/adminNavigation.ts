import type { AdminArea, AdminResource } from '../types/admin'
import { adminTabs } from '../data/adminResources'

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
  if (area === 'operacao' && tab === 'historico')
    return search.get('tipo') === 'b2c' ? 'deliveries' : 'collections'
  if (area === 'comercial' && tab === 'financeiro')
    return search.get('tipo') === 'pagamentos'
      ? 'payments'
      : search.get('tipo') === 'reembolsos'
        ? 'refunds'
        : 'charges'
  return adminTabs[area].find((item) => item.slug === tab)?.resource ?? null
}
