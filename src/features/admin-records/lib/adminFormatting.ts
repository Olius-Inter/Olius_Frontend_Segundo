import type { AdminColumn, AdminScalar } from '../types/admin'

export const adminStatusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CANCELLED: 'Cancelado',
  RECORDED: 'Registrado',
  ANNULLED: 'Anulado',
  SUCCESSFUL: 'Bem-sucedida',
  UNSUCCESSFUL: 'Malsucedida',
  OPEN: 'Aberta',
  PAID: 'Pago',
  EXPIRED: 'Expirado',
  REQUESTED: 'Solicitado',
  PROCESSING: 'Em processamento',
  FAILED: 'Falhou',
  COMPLETED: 'Concluído',
  REVOKED: 'Revogado',
  CANCELLATION_PENDING: 'Cancelamento pendente',
}
export function formatAdminValue(
  value: AdminScalar | undefined,
  format?: AdminColumn['format'],
): string {
  if (value === null || value === undefined || value === '') return '—'
  if (format === 'status') return adminStatusLabels[String(value)] ?? String(value)
  if (format === 'date') {
    const date = new Date(String(value))
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Sao_Paulo',
        }).format(date)
      : '—'
  }
  if (typeof value === 'number')
    return (
      new Intl.NumberFormat(
        'pt-BR',
        format === 'money' ? { style: 'currency', currency: 'BRL' } : { maximumFractionDigits: 2 },
      ).format(value) + (format === 'liters' ? ' L' : '')
    )
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}
