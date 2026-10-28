import type { ReportData, ReportPreferences, SubscriptionPlan } from '../types/reports'

// Valores fictícios inspirados na referência visual; não representam operações reais.
export function createDemoReport({ period, year }: ReportPreferences): ReportData {
  const collection =
    period === 'monthly'
      ? [4980, 3670, 5310, 4680, 6560, 7491, 8240].map((liters, month) => ({
          id: `${year}-${String(month + 1).padStart(2, '0')}`,
          label: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'][month],
          liters,
        }))
      : [38000, 44000, 52000, 63780].map((liters, offset) => ({
          id: String(year - 3 + offset),
          label: String(year - 3 + offset),
          liters,
        }))
  const total = collection.reduce((sum, point) => sum + point.liters, 0)
  const biodiesel = Math.round(total * 0.75)
  const donation = Math.round(total * 0.15)
  const disposal = Math.round(total * 0.07)
  return {
    source: 'demo',
    collection,
    previousPeriodLiters: period === 'monthly' ? 7491 : 52000,
    destinations: [
      { id: 'biodiesel', label: 'Biodiesel', liters: biodiesel },
      { id: 'donation', label: 'Doação', liters: donation },
      { id: 'disposal', label: 'Descarte adequado', liters: disposal },
      { id: 'other', label: 'Outros', liters: total - biodiesel - donation - disposal },
    ],
  }
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plano Básico',
    description: 'Ideal para quem está começando a descartar óleo corretamente.',
    monthlyPriceCents: 1990,
  },
  {
    id: 'professional',
    name: 'Plano Profissional',
    description: 'Ideal para quem quer mais praticidade e acompanhar o impacto.',
    monthlyPriceCents: 3990,
  },
  {
    id: 'business',
    name: 'Plano Empresa',
    description: 'Ideal para empresas que desejam gerar ainda mais impacto.',
    monthlyPriceCents: 7990,
  },
]
