import type { Driver, DriverCreateInput, DriverUpdateInput } from './driver'
export interface DriversGateway {
  drivers?: {
    get: (id: string, signal: AbortSignal) => Promise<Driver | undefined>
    create?: (input: DriverCreateInput, signal: AbortSignal) => Promise<Driver>
    update?: (id: string, input: DriverUpdateInput, signal: AbortSignal) => Promise<Driver>
  }
}
