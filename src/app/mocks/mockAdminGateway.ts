import type {
  AdminRecord,
  AdminFilters,
  AdminResource,
  AdminGateway,
} from '../../features/admin-records/types/admin'
import type { DriversGateway } from '../../features/drivers/types/gateway'
import type {
  AdminDashboardData,
  AdminDetail,
  AdminList,
} from '../../features/admin-records/types/admin'
import { demoPortal } from './demoPortalStore'
import { brasiliaDate } from '../../shared/lib/date'

const clone = <T>(value: T): T => structuredClone(value)
function filtered(rows: AdminRecord[], filters: AdminFilters): AdminRecord[] {
  return rows.filter(
    (row) =>
      (!filters.search ||
        `${row.title} ${Object.values(row.cells).join(' ')}`
          .toLocaleLowerCase('pt-BR')
          .includes(filters.search.toLocaleLowerCase('pt-BR'))) &&
      (!filters.status || row.cells.status === filters.status) &&
      (!row.cells.date ||
        ((!filters.from || brasiliaDate(String(row.cells.date)) >= filters.from) &&
          (!filters.to || brasiliaDate(String(row.cells.date)) <= filters.to))),
  )
}
function records(resource: AdminResource): AdminRecord[] {
  if (resource === 'requests' || resource === 'agenda')
    return demoPortal.requests
      .filter((r) => resource !== 'agenda' || r.status === 'APPROVED')
      .map((r) => ({
        id: r.id,
        title: r.name,
        cells: {
          establishment: r.name,
          requestAt: r.requestedAt,
          date: resource === 'agenda' ? r.scheduledAt : r.requestedAt,
          estimatedLiters: r.estimatedLiters,
          scheduledAt: r.scheduledAt,
          status: r.status,
        },
      }))
  if (resource === 'drivers')
    return demoPortal.drivers.map((driver, index) => ({
      id: driver.id,
      title: driver.name,
      cells: {
        name: driver.name,
        status: driver.status,
        collections: index === 2 ? 0 : 8 + index,
        collectedLiters: index === 2 ? 0 : 540 + index * 80,
        establishments: index === 2 ? 0 : 5 + index,
      },
    }))
  if (resource === 'reports')
    return Array.from({ length: 6 }, (_, index) => ({
      id: `30000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      title: `Semana ${index + 1}`,
      cells: {
        period: `Semana ${index + 1}`,
        collectedLiters: 250 + index * 55,
        acceptedLiters: 50 + index * 9,
        collections: 5 + index,
      },
    }))
  if (resource === 'collections')
    return demoPortal.requests
      .filter((r) => r.completed)
      .map((r, index) => ({
        id: r.id,
        title: r.name,
        cells: {
          date: r.scheduledAt,
          establishment: r.name,
          driver: demoPortal.drivers[index % 2].name,
          presentedLiters: r.estimatedLiters,
          collectedLiters: r.confirmedLiters,
          result: 'SUCCESSFUL',
          revision: 1,
          status: 'RECORDED',
        },
      }))
  return []
}
export function createMockAdminGateway(): AdminGateway & DriversGateway {
  const gateway: AdminGateway & DriversGateway = { resources: {} }
  for (const resource of [
    'requests',
    'agenda',
    'drivers',
    'collections',
    'deliveries',
    'reports',
    'audit',
  ] as AdminResource[]) {
    gateway.resources[resource] = {
      list: async (filters, signal): Promise<AdminList> => {
        signal.throwIfAborted()
        const all = records(resource)
        const items = filtered(all, filters)
        return clone({
          items: items.slice(
            (filters.page - 1) * filters.pageSize,
            filters.page * filters.pageSize,
          ),
          total: items.length,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil(items.length / filters.pageSize),
        })
      },
      detail: async (id, _filters, signal): Promise<AdminDetail> => {
        signal.throwIfAborted()
        const request = demoPortal.requests.find((item) => item.id === id)
        const driver = demoPortal.drivers.find((item) => item.id === id)
        if (!request && !driver) throw new Error('Registro não encontrado.')
        if (driver)
          return {
            id,
            title: driver.name,
            revision: 1,
            sections: [
              {
                title: 'Motorista',
                fields: [
                  { label: 'Situação', value: driver.status, format: 'status' },
                  { label: 'CNH', value: driver.cnh },
                ],
              },
            ],
            history: [],
            actions: [driver.status === 'ACTIVE' ? 'inactivate' : 'activate'],
          }
        if (!request) throw new Error('Registro não encontrado.')
        return clone({
          id,
          title: request.name,
          revision: request.revision,
          sections: [
            {
              title: 'Solicitação',
              fields: [
                { label: 'Endereço de atendimento', value: request.address },
                { label: 'Volume estimado', value: request.estimatedLiters, format: 'liters' },
                { label: 'Visita', value: request.scheduledAt, format: 'date' },
                { label: 'Situação', value: request.status, format: 'status' },
              ],
            },
          ],
          history: request.history,
          actions: request.completed
            ? []
            : request.status === 'PENDING'
              ? ['approve', 'reject']
              : request.status === 'APPROVED'
                ? ['reschedule', 'cancel']
                : [],
        })
      },
      act: async (id, input, signal) => {
        signal.throwIfAborted()
        const driver = demoPortal.drivers.find((item) => item.id === id)
        if (driver) {
          if (!['activate', 'inactivate'].includes(input.action)) throw new Error('Ação inválida.')
          driver.status = input.action === 'activate' ? 'ACTIVE' : 'INACTIVE'
          return
        }
        const request = demoPortal.requests.find((item) => item.id === id)
        if (!request || request.completed) throw new Error('Esta solicitação não admite alteração.')
        if (input.action === 'approve' || input.action === 'reschedule') {
          if (!input.scheduledAt) throw new Error('Informe o horário.')
          request.scheduledAt = input.scheduledAt
          request.endsAt = null
          request.status = 'APPROVED'
        } else if (input.action === 'reject' && request.status === 'PENDING')
          request.status = 'REJECTED'
        else if (input.action === 'cancel' && request.status === 'APPROVED')
          request.status = 'CANCELLED'
        else throw new Error('Ação incompatível com a situação atual.')
        request.revision++
        request.history.push({
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          author: 'Administrador Olius',
          description: `${input.action}: ${input.reason}`,
        })
      },
    }
  }
  gateway.drivers = {
    get: async (id, signal) => {
      signal.throwIfAborted()
      return clone(demoPortal.drivers.find((d) => d.id === id))
    },
    create: async (input, signal) => {
      signal.throwIfAborted()
      if (demoPortal.drivers.some((d) => d.cpf === input.cpf || d.cnh === input.cnh))
        throw new Error('CPF ou CNH já cadastrados.')
      const driver = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      demoPortal.drivers.push(driver)
      return clone(driver)
    },
    update: async (id, input, signal) => {
      signal.throwIfAborted()
      const index = demoPortal.drivers.findIndex((d) => d.id === id)
      if (index < 0) throw new Error('Motorista não encontrado.')
      demoPortal.drivers[index] = {
        ...demoPortal.drivers[index],
        ...input,
        updatedAt: new Date().toISOString(),
      }
      return clone(demoPortal.drivers[index])
    },
  }
  gateway.dashboard = async (filters, signal): Promise<AdminDashboardData> => {
    signal.throwIfAborted()
    const today = brasiliaDate()
    const from = filters.from || `${today.slice(0, 7)}-01`
    const to = filters.to || today
    const completed = demoPortal.requests.filter(
      (request) =>
        request.completed &&
        request.confirmedLiters !== null &&
        request.scheduledAt &&
        brasiliaDate(request.scheduledAt) >= from &&
        brasiliaDate(request.scheduledAt) <= to,
    )
    const start = Date.parse(`${from}T00:00:00-03:00`)
    const end = Date.parse(`${to}T00:00:00-03:00`)
    const days = Math.floor((end - start) / 86400000) + 1
    const bins = Math.min(6, days)
    const summaries = Array.from({ length: bins }, (_, index) => {
      const firstDay = Math.floor((index * days) / bins)
      const nextDay = Math.floor(((index + 1) * days) / bins)
      const date = brasiliaDate(new Date(start + firstDay * 86400000))
      const entries = completed.filter((request) => {
        const day = Math.floor(
          (Date.parse(`${brasiliaDate(request.scheduledAt!)}T00:00:00-03:00`) - start) / 86400000,
        )
        return day >= firstDay && day < nextDay
      })
      return {
        id: date,
        label: date.slice(8, 10) + '/' + date.slice(5, 7),
        liters: entries.reduce((total, request) => total + (request.confirmedLiters ?? 0), 0),
        collections: entries.length,
      }
    })
    return {
      metrics: [
        {
          id: 'pending',
          label: 'Solicitações pendentes',
          value: demoPortal.requests.filter((r) => r.status === 'PENDING').length,
          unit: 'count',
          href: '/operacao/solicitacoes',
        },
        {
          id: 'today',
          label: 'Visitas agendadas hoje',
          value: demoPortal.requests.filter(
            (r) =>
              r.status === 'APPROVED' &&
              !r.completed &&
              r.scheduledAt &&
              brasiliaDate(r.scheduledAt) === today,
          ).length,
          unit: 'count',
          href: '/operacao/agenda',
        },
        {
          id: 'remaining',
          label: 'Visitas restantes no mês',
          value: demoPortal.requests.filter(
            (r) =>
              r.status === 'APPROVED' &&
              !r.completed &&
              r.scheduledAt &&
              brasiliaDate(r.scheduledAt) >= today &&
              brasiliaDate(r.scheduledAt).startsWith(today.slice(0, 7)),
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
          values: summaries.map((row) => ({ id: row.id, label: row.label, value: row.liters })),
        },
        {
          id: 'collections',
          title: 'Coletas ao longo do tempo',
          unit: 'count',
          values: summaries.map((row) => ({
            id: row.id,
            label: row.label,
            value: row.collections,
          })),
        },
      ],
    }
  }
  return gateway
}
