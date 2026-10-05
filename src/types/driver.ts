export type DriverStatus = 'ACTIVE' | 'INACTIVE'

export interface Driver {
  id: string
  name: string
  cpf: string
  cnh: string
  status: DriverStatus
}
