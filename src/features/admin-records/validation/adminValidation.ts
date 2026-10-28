import { validDate } from '../../../shared/lib/validDate.ts'
import type {
  AdminActionInput,
  AdminDetail,
  AdminFilters,
  AdminList,
  AdminResource,
  CollectionRequestListDetails,
} from '../types/admin'

export function defaultAdminFilters(): AdminFilters {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return {
    search: '',
    status: '',
    from: today.slice(0, 7) + '-01',
    to: today,
    page: 1,
    pageSize: 10,
    audience: 'ESTABLISHMENT',
    year: Number(today.slice(0, 4)),
  }
}

export function validateAdminFilters(filters: AdminFilters): boolean {
  return (
    filters.search.length <= 150 &&
    !/[\u0000-\u001f\u007f]/.test(filters.search) &&
    (!filters.from || validDate(filters.from)) &&
    (!filters.to || validDate(filters.to)) &&
    (!filters.from || !filters.to || filters.from <= filters.to) &&
    Number.isSafeInteger(filters.page) &&
    filters.page >= 1 &&
    filters.page <= 100000 &&
    filters.pageSize === 10 &&
    Number.isInteger(filters.year) &&
    filters.year >= 2000 &&
    filters.year <= 2100 &&
    filters.audience === 'ESTABLISHMENT'
  )
}

function validRequestSummary(request: CollectionRequestListDetails | undefined): boolean {
  if (request === undefined) return true
  return Boolean(
    request &&
      ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(request.status) &&
      Number.isSafeInteger(request.revision) &&
      request.revision > 0 &&
      Array.isArray(request.actions) &&
      request.actions.every((action) =>
        ['approve', 'reject', 'restore', 'reschedule', 'cancel'].includes(action),
      ) &&
      (request.scheduledAt === null ||
        (typeof request.scheduledAt === 'string' &&
          Number.isFinite(Date.parse(request.scheduledAt)))) &&
      (request.telephone === null ||
        (typeof request.telephone === 'string' &&
          /^\+?[\d\s()-]{10,22}$/.test(request.telephone))) &&
      (request.email === null ||
        (typeof request.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email))),
  )
}

export function validateAdminList(data: AdminList, filters: AdminFilters): boolean {
  if (
    !data ||
    !Array.isArray(data.items) ||
    data.items.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        !item.cells ||
        typeof item.cells !== 'object' ||
        Array.isArray(item.cells),
    )
  )
    return false
  return (
    Array.isArray(data.items) &&
    data.items.every(
      (item) =>
        typeof item.id === 'string' &&
        item.id.length > 0 &&
        typeof item.title === 'string' &&
        validRequestSummary(item.request) &&
        item.cells &&
        Object.values(item.cells).every(
          (value) =>
            value === null ||
            ['string', 'boolean'].includes(typeof value) ||
            (typeof value === 'number' && Number.isFinite(value)),
        ),
    ) &&
    new Set(data.items.map((item) => item.id)).size === data.items.length &&
    Number.isSafeInteger(data.total) &&
    data.total >= 0 &&
    data.page === filters.page &&
    data.pageSize === filters.pageSize &&
    data.totalPages === Math.ceil(data.total / filters.pageSize) &&
    data.page <= Math.max(1, data.totalPages) &&
    data.items.length ===
      Math.min(filters.pageSize, Math.max(0, data.total - (filters.page - 1) * filters.pageSize))
  )
}

export function validateAdminDetail(data: AdminDetail, id: string): boolean {
  const scalar = (value: unknown) =>
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  if (
    !data ||
    !Array.isArray(data.sections) ||
    !data.sections.every(
      (section) =>
        section &&
        typeof section.title === 'string' &&
        Array.isArray(section.fields) &&
        section.fields.every(
          (field) => field && typeof field.label === 'string' && scalar(field.value),
        ),
    ) ||
    !Array.isArray(data.history) ||
    !data.history.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.author === 'string' &&
        typeof item.description === 'string' &&
        typeof item.date === 'string' &&
        Number.isFinite(Date.parse(item.date)),
    )
  )
    return false
  return (
    (!data.request ||
      (['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(data.request.status) &&
        (data.request.scheduledAt === null ||
          (typeof data.request.scheduledAt === 'string' &&
            Number.isFinite(Date.parse(data.request.scheduledAt)))) &&
        (data.request.telephone === null ||
          (typeof data.request.telephone === 'string' &&
            /^\+?[\d\s()-]{10,22}$/.test(data.request.telephone))) &&
        (data.request.email === null ||
          (typeof data.request.email === 'string' &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.request.email))))) &&
    data.id === id &&
    typeof data.title === 'string' &&
    Array.isArray(data.sections) &&
    Array.isArray(data.history) &&
    new Set(data.history.map((item) => item.id)).size === data.history.length &&
    Array.isArray(data.actions) &&
    data.actions.every((action) =>
      [
        'approve',
        'reject',
        'restore',
        'reschedule',
        'cancel',
        'activate',
        'inactivate',
        'correct',
        'annul',
      ].includes(action),
    ) &&
    (data.revision === null || (Number.isInteger(data.revision) && data.revision > 0))
  )
}

export function validateAdminAction(
  detail: AdminDetail,
  input: AdminActionInput,
  resource: AdminResource,
): string | null {
  if (!detail.actions.includes(input.action))
    return 'Esta ação não foi autorizada para o registro atual.'
  if (resource === 'requests' || resource === 'agenda') {
    if (detail.revision === null || input.expectedRevision !== detail.revision)
      return 'Releia a revisão atual antes da alteração.'
    if (!['approve', 'reject', 'restore', 'reschedule', 'cancel'].includes(input.action))
      return 'Ação inválida para a solicitação.'
    if (
      (input.action === 'approve' || input.action === 'reschedule') &&
      (!input.scheduledAt || !Number.isFinite(Date.parse(input.scheduledAt)))
    )
      return 'Informe a data e o horário programados para a coleta.'
    return null
  }
  if (!input.reason || input.reason.trim().length < 3 || input.reason.length > 1000)
    return 'Informe o motivo, entre 3 e 1000 caracteres.'
  if (input.action === 'reschedule') {
    if (
      !input.scheduledAt ||
      !input.agreedAt ||
      !Number.isFinite(Date.parse(input.scheduledAt)) ||
      !Number.isFinite(Date.parse(input.agreedAt)) ||
      Date.parse(input.agreedAt) > Date.now()
    )
      return 'Informe a visita exata e quando o horário foi combinado.'
  }
  if (
    (input.action === 'correct' || input.action === 'annul') &&
    (detail.revision === null || input.expectedRevision !== detail.revision)
  )
    return 'Releia a revisão atual antes da alteração.'
  if (input.action === 'correct' && !input.changes)
    return 'O formulário de correção depende dos campos autorizados no contrato da operação.'
  return null
}
