import type { AdminDetail } from '../../types/admin-records/admin'
import { integer, object, state, string } from '../core/coreData'

function points(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw new Error('Pontuação recebida em formato inválido.')
  return value
}

export function collectionSections(detail: Record<string, unknown>): AdminDetail['sections'] {
  const collection = object(detail.collection)
  const calculation = object(detail.calculation)
  if (
    typeof collection.hasCompromisingOccurrence !== 'boolean' ||
    !Array.isArray(collection.failureReasonCodes) ||
    !collection.failureReasonCodes.every((code) => typeof code === 'string') ||
    !Array.isArray(calculation.components)
  )
    throw new Error('Detalhes da coleta recebidos em formato inválido.')
  return [
    {
      title: 'Condições e resultado',
      fields: [
        {
          label: 'Condição do óleo',
          value: state(collection.oilCondition, ['ACCEPTABLE', 'UNACCEPTABLE', 'NOT_ASSESSED']),
          format: 'status',
        },
        { label: 'Ocorrência comprometora', value: collection.hasCompromisingOccurrence },
        {
          label: 'Motivos registrados',
          value: collection.failureReasonCodes.length
            ? collection.failureReasonCodes.join(', ')
            : 'Nenhum motivo registrado',
        },
        { label: 'Pontos da coleta', value: points(collection.pointsEarned), format: 'number' },
      ],
    },
    {
      title: 'Cálculo vigente',
      fields: [
        { label: 'Revisão do cálculo', value: integer(calculation.revision) },
        { label: 'Pontos nominais', value: points(calculation.nominalPoints), format: 'number' },
        { label: 'Saldo anterior', value: points(calculation.balanceBefore), format: 'number' },
        {
          label: 'Saldo após o cálculo',
          value: points(calculation.balanceAfter),
          format: 'number',
        },
        {
          label: 'Coletas bem-sucedidas acumuladas',
          value:
            calculation.successfulCollectionsCount === null
              ? null
              : integer(calculation.successfulCollectionsCount),
          format: 'number',
        },
      ],
    },
    ...(calculation.components.length
      ? [
          {
            title: 'Componentes da pontuação',
            fields: calculation.components.map((value) => {
              const component = object(value)
              return {
                label: string(component.component),
                value: points(component.points),
                format: 'number' as const,
              }
            }),
          },
        ]
      : []),
  ]
}
