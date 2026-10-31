export function toScheduleInput(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function scheduleInputToIso(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && toScheduleInput(date.toISOString()) === value
    ? date.toISOString()
    : undefined
}
