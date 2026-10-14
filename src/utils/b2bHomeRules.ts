import type {
  B2BCollectorAuthorization,
  B2BOperation,
  B2BOperationErrors,
  B2BOperationValues,
  B2BOilStock,
} from '../types/b2bHome'

export function canViewB2BOffers(
  collector: B2BCollectorAuthorization | null,
  establishmentId: string,
  now = Date.now(),
): boolean {
  if (
    !collector ||
    collector.kind !== 'ESTABLISHMENT' ||
    collector.establishmentId !== establishmentId ||
    collector.status !== 'APPROVED' ||
    !collector.active ||
    !collector.canViewOffers
  )
    return false
  const start = collector.validFrom === null ? -Infinity : Date.parse(collector.validFrom)
  const end = collector.validUntil === null ? Infinity : Date.parse(collector.validUntil)
  return !Number.isNaN(start) && !Number.isNaN(end) && start <= now && now < end
}

export function validateB2BOperation(
  values: B2BOperationValues,
  operation: B2BOperation,
  stock: B2BOilStock,
): B2BOperationErrors {
  const errors: B2BOperationErrors = {}
  const raw = values.liters.trim()
  const liters = Number(raw.replace(',', '.'))
  if (!raw) errors.liters = 'Informe o volume em litros.'
  else if (!/^\d{1,7}([.,]\d{1,2})?$/.test(raw) || !Number.isFinite(liters) || liters <= 0)
    errors.liters = 'Informe um volume maior que zero, com até duas casas decimais.'
  if (operation === 'request') {
    if (!stock.canRequestCollection)
      errors.liters = stock.blockedReason ?? 'Este estabelecimento não pode solicitar coleta agora.'
    else if (stock.availableLiters === null || stock.minimumCollectionLiters === null)
      errors.liters = 'O saldo e o mínimo de coleta precisam ser confirmados.'
    else if (!errors.liters && liters > stock.availableLiters)
      errors.liters = 'O volume supera o saldo disponível para novas solicitações.'
    else if (!errors.liters && liters < stock.minimumCollectionLiters)
      errors.liters = `O mínimo vigente é ${formatB2BNumber(stock.minimumCollectionLiters)} L.`
    const start = Date.parse(values.windowStart)
    const end = Date.parse(values.windowEnd)
    if (!values.windowStart || !Number.isFinite(start))
      errors.windowStart = 'Informe o início da janela de coleta.'
    else if (start < Date.now()) errors.windowStart = 'Escolha um horário futuro para a coleta.'
    if (!values.windowEnd || !Number.isFinite(end))
      errors.windowEnd = 'Informe o fim da janela de coleta.'
    else if (Number.isFinite(start) && end <= start)
      errors.windowEnd = 'O fim deve ser posterior ao início da janela.'
  }
  return errors
}

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})
const windowFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})
export const formatB2BNumber = (value: number): string => numberFormat.format(value)
export const formatB2BDate = (value: string): string => dateFormat.format(new Date(value))
export const formatB2BWindow = (value: string): string => windowFormat.format(new Date(value))
