import type { AdminAction, AdminActionInput } from '../../features/admin-records/types/admin'
import type { DemoRequest } from './demo'

export function availableRequestActions(request: DemoRequest): AdminAction[] {
  if (request.completed) return []
  if (request.status === 'PENDING') return ['approve', 'reject']
  if (request.status === 'APPROVED') return ['reschedule', 'cancel']
  if (request.status === 'REJECTED') return ['restore']
  return []
}

export function applyDemoRequestAction(request: DemoRequest, input: AdminActionInput): DemoRequest {
  if (!availableRequestActions(request).includes(input.action))
    throw new Error('Ação incompatível com a situação atual.')
  if (input.expectedRevision !== request.revision)
    throw new Error('A revisão mudou. Atualize a solicitação antes de tentar novamente.')
  const next = structuredClone(request)
  const labels: Partial<Record<AdminAction, string>> = {
    approve: 'Coleta aprovada',
    reject: 'Solicitação rejeitada',
    restore: 'Solicitação recuperada para análise',
    reschedule: 'Agendamento alterado',
    cancel: 'Solicitação cancelada',
  }
  if (input.action === 'approve' || input.action === 'reschedule') {
    if (!input.scheduledAt || !Number.isFinite(Date.parse(input.scheduledAt)))
      throw new Error('Informe a data e o horário programados para a coleta.')
    next.scheduledAt = input.scheduledAt
    next.endsAt = null
    next.status = 'APPROVED'
  } else if (input.action === 'reject') next.status = 'REJECTED'
  else if (input.action === 'restore') {
    next.status = 'PENDING'
    next.scheduledAt = null
    next.endsAt = null
  } else if (input.action === 'cancel') next.status = 'CANCELLED'
  next.revision++
  next.history.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    author: 'Administrador Olius',
    description:
      (labels[input.action] ?? input.action) +
      (input.action === 'reschedule' ? ' (anterior: ' + request.scheduledAt + ')' : '') +
      (input.scheduledAt ? ': ' + input.scheduledAt : ''),
  })
  return next
}
