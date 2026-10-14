import type { DriverTouched, DriverValidationAction, DriverValidationState } from '../types/driver'

const allTouched: DriverTouched = { name: true, cpf: true, cnh: true, status: true }
export function driverValidationReducer(
  state: DriverValidationState,
  action: DriverValidationAction,
): DriverValidationState {
  switch (action.type) {
    case 'change':
      return { phase: 'editing', touched: state.touched }
    case 'blur':
      return { ...state, touched: { ...state.touched, [action.field]: true } }
    case 'valid':
      return { phase: 'valid', touched: { ...allTouched } }
    case 'invalid':
      return { phase: 'invalid', touched: { ...allTouched }, firstError: action.firstError }
  }
}
