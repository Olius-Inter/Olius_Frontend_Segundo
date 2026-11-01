import type { Driver } from '../../features/drivers/types/driver'
import type { PortalNotification } from '../../features/notifications/types/notifications'
import type { PortalPlan, PortalProfile } from '../../features/settings/types/settings'
import { brasiliaDate } from '../../shared/lib/date'

import type { DemoRequest } from './demo'
const today = brasiliaDate()
const stamp = (offset: number, hour: number, minute = 0): string => {
  const date = new Date(`${today}T12:00:00-03:00`)
  date.setUTCDate(date.getUTCDate() + offset)
  return `${brasiliaDate(date)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-03:00`
}
const id = (index: number) => `10000000-0000-0000-0000-${String(index).padStart(12, '0')}`
const names = [
  'Restaurante Aurora',
  'Cantina Jardim',
  'Hotel Horizonte',
  'Padaria Boa Mesa',
  'Cozinha da Praça',
  'Restaurante Sabor Verde',
  'Mercado União',
  'Cantina Central',
  'Bistrô das Flores',
  'Cozinha Escola',
  'Restaurante Estação',
  'Hotel Primavera',
]
const requests: DemoRequest[] = names.map((name, index) => {
  const offset = [-3, -1, 0, 0, 0, 1, 2, 7, 8, 12, 15, 20][index]
  const scheduledAt =
    index >= 9
      ? null
      : stamp(offset, index === 2 || index === 3 ? 9 : 8 + (index % 5), index === 3 ? 30 : 0)
  return {
    id: id(index + 1),
    name,
    telephone: '(11) 99999-0200',
    email: 'contato' + (index + 1) + '@estabelecimento.olius.test',
    address: `Rua de Exemplo ${index + 1}, Centro · São Paulo/SP`,
    status: index === 11 ? 'REJECTED' : scheduledAt ? 'APPROVED' : 'PENDING',
    requestedAt: stamp(-6, 8),
    scheduledAt,
    endsAt: scheduledAt ? new Date(Date.parse(scheduledAt) + 60 * 60 * 1000).toISOString() : null,
    estimatedLiters: 50 + index * 8,
    confirmedLiters: offset < 0 ? 48 + index * 8 : null,
    revision: 1,
    completed: offset < 0,
    history: [
      {
        id: id(index + 101),
        date: stamp(-6, 8),
        author: 'Administrador Olius',
        description: 'Solicitação registrada.',
      },
    ],
  }
})
export const demoPortal = {
  profile: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Administrador Olius',
    email: 'admin@olius.test',
    telephone: '(11) 99999-0100',
    avatarUrl: '/demo/avatar.png',
  } as PortalProfile,
  password: 'OliusTeste123!',
  requests,
  drivers: [
    {
      id: id(201),
      name: 'Marcos Almeida',
      cpf: '52998224725',
      cnh: '12345678901',
      status: 'ACTIVE',
      createdAt: stamp(-60, 8),
    },
    {
      id: id(202),
      name: 'Ana Ribeiro',
      cpf: '11144477735',
      cnh: '23456789012',
      status: 'ACTIVE',
      createdAt: stamp(-45, 8),
    },
    {
      id: id(203),
      name: 'João Costa',
      cpf: '12345678909',
      cnh: '34567890123',
      status: 'INACTIVE',
      createdAt: stamp(-90, 8),
    },
  ] as Driver[],
  notifications: [
    {
      id: id(301),
      title: 'Nova solicitação para análise',
      description:
        'A Cozinha Escola enviou um pedido de coleta. Confira os dados antes de aprovar.',
      date: stamp(0, 8),
      category: 'REQUESTS',
      read: false,
      href: `/operacao/solicitacoes/${id(10)}`,
    },
    {
      id: id(302),
      title: 'Há mais de uma visita no mesmo horário',
      description: 'Confira os horários da agenda de hoje. A organização da logística é externa.',
      date: stamp(0, 7),
      category: 'AGENDA',
      read: false,
      href: '/operacao/agenda',
    },
    {
      id: id(303),
      title: 'Agenda atualizada',
      description: 'As visitas confirmadas já aparecem no calendário.',
      date: stamp(-1, 15),
      category: 'AGENDA',
      read: false,
      href: '/operacao/agenda',
    },
    {
      id: id(304),
      title: 'Bem-vindo ao Olius',
      description: 'Acompanhe os avisos da operação e mantenha suas leituras em dia.',
      date: stamp(-2, 10),
      category: 'SYSTEM',
      read: true,
      href: null,
    },
  ] as PortalNotification[],
  plans: [
    {
      id: 'basic',
      name: 'Básico',
      description: 'Para organizar o início da sua operação.',
      monthlyPrice: 29,
      annualPrice: 290,
      liters: 100,
      collections: 2,
      features: [
        'Acompanhamento de solicitações',
        'Histórico de coletas',
        'Indicadores do período',
      ],
      featured: false,
      active: true,
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Mais capacidade para uma rotina em crescimento.',
      monthlyPrice: 59,
      annualPrice: 590,
      liters: 300,
      collections: 4,
      features: [
        'Tudo do plano Básico',
        'Maior franquia de coleta',
        'Acompanhamento dos resultados',
      ],
      featured: true,
      active: true,
    },
    {
      id: 'business',
      name: 'Empresa',
      description: 'Para estabelecimentos com maior volume.',
      monthlyPrice: 99,
      annualPrice: 990,
      liters: 600,
      collections: 8,
      features: ['Tudo do plano Profissional', 'Maior limite de litros', 'Mais coletas no ciclo'],
      featured: false,
      active: true,
    },
  ] as PortalPlan[],
}
export function addDemoNotification(title: string, description: string, href: string) {
  demoPortal.notifications.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    href,
    category: 'AGENDA',
    read: false,
    date: new Date().toISOString(),
  })
}
