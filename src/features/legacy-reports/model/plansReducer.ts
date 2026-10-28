import type { PlansAction, PlansState } from '../types/reports'

export const initialPlansState: PlansState = { phase: 'closed', selectedPlan: null, feedback: null }
export function plansReducer(state: PlansState, action: PlansAction): PlansState {
  switch (action.type) {
    case 'open':
      return { phase: 'choosing', selectedPlan: state.selectedPlan, feedback: null }
    case 'close':
      return { phase: 'closed', selectedPlan: state.selectedPlan, feedback: null }
    case 'invalid':
      return state.phase === 'closed'
        ? state
        : { phase: 'error', selectedPlan: state.selectedPlan, feedback: action.message }
    case 'choose':
      return state.phase === 'closed'
        ? state
        : {
            phase: 'closed',
            selectedPlan: action.plan.id,
            feedback: `${action.plan.name} selecionado nesta demonstração. Nenhuma assinatura ou cobrança foi realizada.`,
          }
  }
}
