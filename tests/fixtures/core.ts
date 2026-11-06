// Dados fictícios para testar contratos e renderização; nenhum serviço real é chamado.
export const fixtureIds = {
  driver: '11111111-1111-4111-8111-111111111111',
  establishment: '22222222-2222-4222-8222-222222222222',
  request: '33333333-3333-4333-8333-333333333333',
  collection: '44444444-4444-4444-8444-444444444444',
  invitation: '55555555-5555-4555-8555-555555555555',
  pev: '66666666-6666-4666-8666-666666666666',
  admin: '77777777-7777-4777-8777-777777777777',
}
export const fixtureDate = new Date().toISOString()
export const fixtureAddress = {
  id: fixtureIds.pev,
  street: 'Rua da Core',
  number: '42',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  cep: '01001000',
  complement: 'Sala da Core',
  latitude: null,
  longitude: null,
}
export const fixtureAdmin = {
  id: fixtureIds.admin,
  name: 'Administrador da Core',
  email: 'admin@example.test',
  userType: 'ADMIN',
  status: 'ACTIVE',
  createdAt: fixtureDate,
  telephones: ['11912345678'],
  address: null,
}
export const fixtureEstablishment = {
  ...fixtureAdmin,
  id: fixtureIds.establishment,
  name: 'Empresa da Core',
  email: 'empresa@example.test',
  userType: 'ESTABLISHMENT',
  address: fixtureAddress,
}
export const fixtureDriver = {
  id: fixtureIds.driver,
  name: 'Condutor da Core',
  cpf: '52998224725',
  cnh: '12345678901',
  status: 'ACTIVE',
  registrationDate: fixtureDate,
  updatedAt: fixtureDate,
}
export const fixtureCollection = {
  id: fixtureIds.collection,
  requestId: fixtureIds.request,
  establishmentId: fixtureIds.establishment,
  driverId: fixtureIds.driver,
  collectedVolumeLiters: 18.75,
  presentedVolumeLiters: 20.5,
  oilCondition: 'ACCEPTABLE',
  hasCompromisingOccurrence: false,
  result: 'SUCCESSFUL',
  pointsEarned: 3,
  observation: 'Observação da coleta',
  collectionDate: fixtureDate,
  createdAt: fixtureDate,
  processingOrder: 1,
  recordStatus: 'RECORDED',
  revision: 2,
  failureReasonCodes: [],
}
export const fixtureCalculation = {
  id: fixtureIds.collection,
  revision: 4,
  nominalPoints: 3,
  balanceBefore: -7,
  balanceAfter: -4,
  successfulCollectionsCount: 2,
  components: [
    { component: 'Volume recolhido', points: 5 },
    { component: 'Ajuste operacional', points: -2 },
  ],
}
export function fixtureRequest(status = 'PENDING') {
  return {
    id: fixtureIds.request,
    establishmentId: fixtureIds.establishment,
    subscriptionCycleId: fixtureIds.establishment,
    status,
    estimatedVolumeLiters: 27.5,
    observation: 'Observação da solicitação',
    requestAt: fixtureDate,
    updatedAt: fixtureDate,
    scheduledAt: status === 'APPROVED' ? fixtureDate : null,
    approval: null,
    arrival: null,
    acceptance: null,
    cancellation: null,
    collectionId: null,
  }
}
export const fixtureInvitations = ['AVAILABLE', 'ACCEPTED', 'EXPIRED', 'REVOKED'].map(
  (state, index) => ({
    id:
      index === 0
        ? fixtureIds.invitation
        : `55555555-5555-4555-8555-${String(index).padStart(12, '0')}`,
    name: `Convidado ${state}`,
    email: `convite${index}@example.test`,
    state,
    issuedAt: fixtureDate,
    expiresAt: '2030-12-01T15:00:00Z',
    invitedBy: fixtureIds.admin,
    bootstrap: false,
    acceptedAt: null,
    acceptedUserId: null,
    revokedAt: null,
    revokedBy: null,
  }),
)
export type FixtureMode = 'populated' | 'empty' | 'zero'
export function fixturePage(items: unknown[], url: URL) {
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 20)
  return {
    items: items.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: items.length,
  }
}
export function fixturePayload(url: URL, mode: FixtureMode): unknown {
  const path = url.pathname
  const items = <T>(value: T[]): T[] => (mode === 'populated' ? value : [])
  if (path === '/api/v1/users/me' || path === `/api/v1/users/${fixtureIds.admin}`)
    return fixtureAdmin
  if (path === `/api/v1/users/${fixtureIds.establishment}`) return fixtureEstablishment
  if (path === '/api/v1/admin/environmental-summary') {
    const zero = mode === 'zero' || mode === 'empty'
    return {
      from: url.searchParams.get('from'),
      until: url.searchParams.get('until'),
      collections: {
        count: zero ? 0 : 2,
        successful: zero ? 0 : 1,
        unsuccessful: zero ? 0 : 1,
        collectedVolumeLiters: zero ? 0 : 30.5,
        establishments: zero ? 0 : 1,
      },
      deliveries: { count: 9, acceptedVolumeLiters: 999, citizens: 9, pevs: 1 },
    }
  }
  if (path === '/api/v1/subscription-plans')
    return items([
      {
        id: fixtureIds.invitation,
        name: 'Plano da Core',
        description: 'Descrição da Core',
        monthlyPrice: 19.9,
        volumeLimitLiters: 100,
        collectionLimit: 2,
      },
    ])
  if (path === '/api/v1/admin/drivers') return fixturePage(items([fixtureDriver]), url)
  if (path === `/api/v1/admin/drivers/${fixtureIds.driver}`) return fixtureDriver
  if (path === `/api/v1/admin/drivers/${fixtureIds.driver}/metrics`)
    return {
      visits: 2,
      collectedVolumeLiters: 47.25,
      establishmentsVisited: 1,
      lastCollectionDate: fixtureDate,
      successfulVisits: 1,
      unsuccessfulVisits: 1,
    }
  if (path === '/api/v1/admin/collection-requests')
    return fixturePage(items([fixtureRequest(url.searchParams.get('status') ?? 'PENDING')]), url)
  if (path === `/api/v1/admin/collection-requests/${fixtureIds.request}`)
    return fixtureRequest(url.searchParams.get('state') ?? 'PENDING')
  if (path === '/api/v1/admin/collections') return fixturePage(items([fixtureCollection]), url)
  if (path === `/api/v1/admin/collections/${fixtureIds.collection}`)
    return { collection: fixtureCollection, calculation: fixtureCalculation }
  if (path === '/api/v1/admin/invitations') return fixturePage(items(fixtureInvitations), url)
  if (path === '/api/v1/admin/pevs') {
    const ownerType = url.searchParams.get('ownerType') ?? 'ESTABLISHMENT'
    return fixturePage(
      items([
        {
          id: fixtureIds.pev,
          ownerType,
          ownerName: `Responsável ${ownerType}`,
          status: 'PENDING',
          createdAt: fixtureDate,
          address: fixtureAddress,
        },
      ]),
      url,
    )
  }
  return undefined
}
