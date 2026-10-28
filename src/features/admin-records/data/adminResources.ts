import type { AdminArea, AdminResource, AdminResourceConfig } from '../types/admin'

const active = ['ACTIVE', 'INACTIVE']
const approval = ['PENDING', 'APPROVED', 'REJECTED', 'INACTIVE']
const source = 'Catálogo administrativo 15/10 + decisões 20/10; DB_Segundo 974eb4dc'
export const adminResources: Record<AdminResource, AdminResourceConfig> = {
  requests: {
    id: 'requests',
    title: 'Solicitações',
    description: 'Análise dos pedidos e registro dos horários combinados externamente.',
    statuses: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    columns: [
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'requestAt', label: 'Pedido', format: 'date' },
      { key: 'estimatedLiters', label: 'Estimado', format: 'liters' },
      { key: 'status', label: 'Situação', format: 'status' },
      { key: 'scheduledAt', label: 'Agendamento', format: 'date' },
    ],
    source,
  },
  agenda: {
    id: 'agenda',
    title: 'Agenda',
    description:
      'Visitas aprovadas, com data e horário exatos. A logística é organizada externamente.',
    statuses: ['APPROVED'],
    columns: [
      { key: 'scheduledAt', label: 'Visita', format: 'date' },
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'status', label: 'Situação', format: 'status' },
    ],
    source,
  },
  collections: {
    id: 'collections',
    title: 'Histórico de coletas B2B',
    description:
      'Volumes vigentes, revisões e anulações. Resultado malsucedido não atribui responsabilidade ao motorista.',
    statuses: ['RECORDED', 'ANNULLED'],
    columns: [
      { key: 'date', label: 'Coleta física', format: 'date' },
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'driver', label: 'Motorista' },
      { key: 'presentedLiters', label: 'Apresentado', format: 'liters' },
      { key: 'collectedLiters', label: 'Recolhido', format: 'liters' },
      { key: 'result', label: 'Resultado', format: 'status' },
      { key: 'revision', label: 'Revisão' },
      { key: 'status', label: 'Registro', format: 'status' },
    ],
    source,
  },
  deliveries: {
    id: 'deliveries',
    title: 'Histórico de entregas B2C',
    description: 'Recebimentos confirmados pelo responsável autenticado do PEV.',
    statuses: ['RECORDED', 'ANNULLED'],
    columns: [
      { key: 'date', label: 'Entrega', format: 'date' },
      { key: 'citizen', label: 'Cidadão' },
      { key: 'pev', label: 'PEV' },
      { key: 'validator', label: 'Responsável' },
      { key: 'acceptedLiters', label: 'Aceito', format: 'liters' },
      { key: 'points', label: 'Pontos', format: 'number' },
      { key: 'revision', label: 'Revisão' },
      { key: 'status', label: 'Registro', format: 'status' },
    ],
    source,
  },
  drivers: {
    id: 'drivers',
    title: 'Motoristas',
    description:
      'Cadastros operacionais, sem login. Inativação preserva coletas e vínculos históricos.',
    statuses: active,
    columns: [
      { key: 'name', label: 'Nome' },
      { key: 'status', label: 'Situação', format: 'status' },
      { key: 'collections', label: 'Coletas no período', format: 'number' },
      { key: 'collectedLiters', label: 'Recolhido no período', format: 'liters' },
      { key: 'establishments', label: 'Estabelecimentos atendidos', format: 'number' },
    ],
    source,
  },
  establishments: {
    id: 'establishments',
    title: 'Estabelecimentos',
    description: 'Consulta dos dados necessários à operação e situação das contas.',
    statuses: active,
    columns: [
      { key: 'name', label: 'Estabelecimento' },
      { key: 'city', label: 'Cidade' },
      { key: 'status', label: 'Conta', format: 'status' },
    ],
    source,
  },
  citizens: {
    id: 'citizens',
    title: 'Cidadãos',
    description:
      'Consulta controlada. O cidadão comum entrega óleo ao PEV e não solicita retirada.',
    statuses: active,
    columns: [
      { key: 'name', label: 'Cidadão' },
      { key: 'status', label: 'Conta', format: 'status' },
    ],
    source,
  },
  pevs: {
    id: 'pevs',
    title: 'PEVs',
    description: 'Pontos com responsável único, endereço próprio e aprovação administrativa.',
    statuses: approval,
    columns: [
      { key: 'responsible', label: 'Responsável' },
      { key: 'address', label: 'Endereço do ponto' },
      { key: 'status', label: 'Situação', format: 'status' },
      { key: 'acceptedLiters', label: 'Recebido no período', format: 'liters' },
    ],
    source,
  },
  plans: {
    id: 'plans',
    title: 'Planos',
    description: 'Catálogo comercial. Mudanças futuras não reescrevem condições históricas.',
    statuses: active,
    columns: [
      { key: 'name', label: 'Plano' },
      { key: 'monthlyPrice', label: 'Mensalidade', format: 'money' },
      { key: 'volumeLimit', label: 'Franquia', format: 'liters' },
      { key: 'collectionLimit', label: 'Coletas', format: 'number' },
      { key: 'status', label: 'Situação', format: 'status' },
    ],
    source,
  },
  subscriptions: {
    id: 'subscriptions',
    title: 'Assinaturas',
    description:
      'Ciclos, franquia, reservas, uso físico e perdas por cancelamento são conceitos distintos.',
    statuses: ['PENDING', 'ACTIVE', 'INACTIVE'],
    columns: [
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'plan', label: 'Plano contratado' },
      { key: 'cycle', label: 'Ciclo' },
      { key: 'reservedLiters', label: 'Reservado', format: 'liters' },
      { key: 'usedLiters', label: 'Utilizado', format: 'liters' },
      { key: 'forfeitedLiters', label: 'Perdas por cancelamento', format: 'liters' },
      { key: 'status', label: 'Situação', format: 'status' },
    ],
    source,
  },
  charges: {
    id: 'charges',
    title: 'Cobranças',
    description: 'Situação informada pelas integrações. Pagamento não é confirmado manualmente.',
    statuses: ['OPEN', 'CANCELLATION_PENDING', 'PAID', 'CANCELLED', 'EXPIRED'],
    columns: [
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'amount', label: 'Valor', format: 'money' },
      { key: 'status', label: 'Cobrança', format: 'status' },
      { key: 'benefit', label: 'Benefício' },
    ],
    source,
  },
  payments: {
    id: 'payments',
    title: 'Pagamentos',
    description: 'Confirmação do provedor e aplicação de benefícios são etapas independentes.',
    statuses: [],
    columns: [
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'amount', label: 'Valor', format: 'money' },
      { key: 'paidAt', label: 'Pagamento', format: 'date' },
      { key: 'verifiedAt', label: 'Verificação', format: 'date' },
      { key: 'application', label: 'Aplicação' },
    ],
    source,
  },
  refunds: {
    id: 'refunds',
    title: 'Reembolsos',
    description: 'Solicitação de reembolso não comprova conclusão pelo provedor.',
    statuses: ['REQUESTED', 'PROCESSING', 'FAILED', 'COMPLETED'],
    columns: [
      { key: 'amount', label: 'Valor', format: 'money' },
      { key: 'reason', label: 'Motivo' },
      { key: 'status', label: 'Integração', format: 'status' },
      { key: 'completedAt', label: 'Confirmação', format: 'date' },
    ],
    source,
  },
  reports: {
    id: 'reports',
    title: 'Relatórios',
    description:
      'Totais oficiais do período completo, sem operações anuladas ou duplicidade por motivos de falha.',
    statuses: [],
    columns: [
      { key: 'period', label: 'Período' },
      { key: 'collectedLiters', label: 'Recolhido B2B', format: 'liters' },
      { key: 'acceptedLiters', label: 'Recebido PEV', format: 'liters' },
      { key: 'collections', label: 'Coletas', format: 'number' },
    ],
    source,
  },
  certificates: {
    id: 'certificates',
    title: 'Certificados ambientais',
    description:
      'Volume oficial, progresso, nível, validade e histórico. Não são comprovantes comerciais de plano.',
    statuses: ['ACTIVE', 'REVOKED'],
    columns: [
      { key: 'establishment', label: 'Estabelecimento' },
      { key: 'level', label: 'Nível' },
      { key: 'collectedLiters', label: 'Volume oficial', format: 'liters' },
      { key: 'validUntil', label: 'Validade', format: 'date' },
      { key: 'status', label: 'Situação', format: 'status' },
    ],
    source,
  },
  admins: {
    id: 'admins',
    title: 'Contas administrativas',
    description: 'Criação protegida e consulta por identificador autorizado.',
    statuses: active,
    columns: [
      { key: 'name', label: 'Nome' },
      { key: 'status', label: 'Situação', format: 'status' },
    ],
    source,
  },
  audit: {
    id: 'audit',
    title: 'Auditoria',
    description:
      'Autoria, motivo, data e valores anteriores/novos. Depende de mecanismo controlado na API.',
    statuses: [],
    columns: [
      { key: 'date', label: 'Alteração', format: 'date' },
      { key: 'author', label: 'Autor' },
      { key: 'operation', label: 'Operação' },
      { key: 'reason', label: 'Motivo' },
    ],
    source,
  },
}
export const adminTabs: Record<
  AdminArea,
  { slug: string; title: string; resource: AdminResource }[]
> = {
  operacao: [
    { slug: 'solicitacoes', title: 'Solicitações', resource: 'requests' },
    { slug: 'agenda', title: 'Agenda', resource: 'agenda' },
    { slug: 'historico', title: 'Histórico', resource: 'collections' },
  ],
  cadastros: [{ slug: 'motoristas', title: 'Motorista', resource: 'drivers' }],
  comercial: [],
  resultados: [],
  administracao: [
    { slug: 'contas', title: 'Contas', resource: 'admins' },
    { slug: 'auditoria', title: 'Auditoria', resource: 'audit' },
  ],
}
