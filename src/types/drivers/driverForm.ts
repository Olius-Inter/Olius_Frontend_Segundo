import type { Driver, DriverFormMode, DriverFormValues } from './driver'

export interface DriverFormProps {
  mode: DriverFormMode
  initialValues: DriverFormValues
  driver?: Driver
}
