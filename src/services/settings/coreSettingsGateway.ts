import type { SettingsGateway } from '../../types/settings/settings'
import { corePublicGet } from '../coreClient'
import { number, object, string, uuid } from '../core/coreData'

export function createCoreSettingsGateway(): SettingsGateway {
  return {
    plans: {
      list: async (signal) => {
        const data: unknown = await (
          await corePublicGet('/api/v1/subscription-plans', signal)
        ).json()
        if (!Array.isArray(data)) throw new Error('Catálogo recebido em formato inválido.')
        return data.map((value: unknown) => {
          const plan = object(value)
          return {
            id: uuid(plan.id),
            name: string(plan.name),
            description: plan.description === null ? '' : string(plan.description),
            monthlyPrice: number(plan.monthlyPrice),
            annualPrice: null,
            liters: number(plan.volumeLimitLiters),
            collections: number(plan.collectionLimit),
            features: [],
            featured: false,
            active: true,
          }
        })
      },
    },
  }
}
