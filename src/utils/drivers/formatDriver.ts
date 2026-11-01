export function maskCnh(cnh: string): string {
  const digits = cnh.replace(/\D/g, '')
  return digits.length >= 4 ? `•••••••${digits.slice(-4)}` : 'CNH indisponível'
}
