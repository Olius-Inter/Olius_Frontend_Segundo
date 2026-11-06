import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let serial = 0
async function modules() {
  const cache = new Map()
  const version = serial++
  async function load(file) {
    if (cache.has(file.href)) return cache.get(file.href)
    const source = (await readFile(file, 'utf8'))
      .replaceAll('import.meta.env.VITE_API_BASE_URL', '"https://core.example.test"')
      .replaceAll('import.meta.env.VITE_LOCAL_ADMIN_DEMO', '"false"')
    let output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
    }).outputText
    for (const match of [...output.matchAll(/from ['"]([^'"]+)['"]/g)]) {
      const spec = match[1]
      const dependency = new URL(spec.endsWith('.ts') ? spec : `${spec}.ts`, file)
      output = output.replace(match[0], `from '${await load(dependency)}'`)
    }
    const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}#${version}`
    cache.set(file.href, url)
    return url
  }
  const paths = {
    core: 'coreClient',
    data: 'core/coreData',
    drivers: 'drivers/coreDriversGateway',
    requests: 'admin-records/coreRequestsResource',
    collections: 'admin-records/coreCollectionsResource',
    schedule: 'schedule/coreScheduleGateway',
    reports: 'reports/coreOperationalReports',
    settings: 'settings/coreSettingsGateway',
  }
  const result = {}
  for (const [key, path] of Object.entries(paths))
    result[key] = await import(
      await load(new URL(`../../src/services/${path}.ts`, import.meta.url))
    )
  return result
}
const id = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const at = '2026-11-02T12:00:00Z'
const filters = {
  search: '',
  status: '',
  from: '2026-11-01',
  to: '2026-11-02',
  page: 1,
  pageSize: 10,
  audience: 'ESTABLISHMENT',
  year: 2026,
}
const signal = () => new AbortController().signal
const driver = (status = 'ACTIVE') => ({
  id,
  name: 'Motorista',
  cpf: '12345678901',
  cnh: '10987654321',
  status,
  registrationDate: at,
  updatedAt: at,
})
const request = (changes = {}) => ({
  id,
  establishmentId: other,
  status: 'APPROVED',
  estimatedVolumeLiters: 20,
  requestAt: '2026-09-01T12:00:00Z',
  updatedAt: at,
  scheduledAt: at,
  observation: null,
  collectionId: null,
  ...changes,
})
const collection = (changes = {}) => ({
  id,
  requestId: other,
  establishmentId: other,
  driverId: id,
  collectedVolumeLiters: 15,
  presentedVolumeLiters: 20,
  collectionDate: at,
  result: 'SUCCESSFUL',
  recordStatus: 'RECORDED',
  revision: 2,
  observation: null,
  ...changes,
})
const profile = () => ({
  id: other,
  userType: 'ESTABLISHMENT',
  name: 'Empresa',
  email: 'empresa@example.test',
  telephones: ['11999999999'],
  address: {
    street: 'Rua A',
    number: '12',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  },
})
const page = (items, size = 10, index = 0, total = items.length) =>
  Response.json({ items, size, page: index, totalElements: total })
async function fixture(handler, run, login = true) {
  const previous = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    if (url.endsWith('/csrf'))
      return Response.json({ headerName: 'X-XSRF-TOKEN', token: 'fixture-csrf' })
    if (url.endsWith('/web/login'))
      return Response.json({
        accessToken: 'fixture-access',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 900000).toISOString(),
      })
    return handler(new URL(url), init)
  }
  try {
    const api = await modules()
    if (login) await api.core.coreLogin({ email: 'admin@example.test', password: 'fixture' })
    await run(api, calls)
  } finally {
    globalThis.fetch = previous
  }
}

test('motoristas: listagem mapeia métricas e período físico, sem enviar busca hipotética', async () => {
  await fixture(
    (url) =>
      url.pathname.endsWith('/metrics')
        ? Response.json({
            visits: 3,
            collectedVolumeLiters: 40,
            establishmentsVisited: 2,
            lastCollectionDate: at,
            successfulVisits: 2,
            unsuccessfulVisits: 1,
          })
        : page([driver()]),
    async ({ drivers }, calls) => {
      const result = await drivers.createCoreDriverResource().list(filters, signal())
      assert.equal(result.items[0].cells.collectedLiters, 40)
      assert.equal(result.items[0].cells.collections, 3)
      assert.equal(result.items[0].cells.establishments, 2)
      const metrics = new URL(calls.at(-1).url)
      assert.equal(metrics.searchParams.get('from'), '2026-11-01T03:00:00.000Z')
      assert.equal(metrics.searchParams.get('until'), '2026-11-03T03:00:00.000Z')
      assert.equal(calls.at(-1).init.headers.Authorization, 'Bearer fixture-access')
      await assert.rejects(
        drivers.createCoreDriverResource().list({ ...filters, search: 'nome' }, signal()),
        /Limpe o campo Buscar/,
      )
    },
  )
})

test('motoristas: criação e edição projetam somente os campos reais da API', async () => {
  await fixture(
    () => Response.json(driver()),
    async ({ drivers }, calls) => {
      const gateway = drivers.createCoreDriversGateway().drivers
      await gateway.create(
        { name: 'Motorista', cpf: '12345678901', cnh: '10987654321', status: 'ACTIVE' },
        signal(),
      )
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), {
        name: 'Motorista',
        cpf: '12345678901',
        cnh: '10987654321',
      })
      await gateway.update(
        id,
        { name: 'Motorista', cnh: '10987654321', cpf: 'não enviar', status: 'INACTIVE' },
        signal(),
      )
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), {
        name: 'Motorista',
        cnh: '10987654321',
      })
      const count = calls.length
      await assert.rejects(
        gateway.create(
          { name: 'Motorista', cpf: '12345678901', cnh: '10987654321', status: 'INACTIVE' },
          signal(),
        ),
        /ativos/,
      )
      assert.equal(calls.length, count)
    },
  )
})

test('motoristas: ativação envia status e consulta inexistente retorna undefined', async () => {
  await fixture(
    (url, init) =>
      init.method === 'PATCH'
        ? Response.json(driver('INACTIVE'))
        : new Response(null, { status: 404 }),
    async ({ drivers }, calls) => {
      await drivers
        .createCoreDriverResource()
        .act(id, { action: 'inactivate', reason: 'Não transmitir' }, signal())
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), { status: 'INACTIVE' })
      assert.equal(await drivers.createCoreDriversGateway().drivers.get(id, signal()), undefined)
    },
  )
})

test('solicitações: consulta enriquece empresa e mantém ações adiadas desabilitadas', async () => {
  await fixture(
    (url) =>
      url.pathname.includes('/users/')
        ? Response.json(profile())
        : url.pathname.endsWith(id)
          ? Response.json(request())
          : page([request()]),
    async ({ requests }) => {
      const gateway = requests.createCoreRequestsResource()
      const rows = await gateway.list(filters, signal())
      assert.equal(rows.items[0].title, 'Empresa')
      assert.match(rows.items[0].cells.address, /Rua A, 12/)
      assert.equal(rows.items[0].cells.estimatedLiters, 20)
      const detail = await gateway.detail(id, filters, signal())
      assert.equal(detail.request.email, 'empresa@example.test')
      assert.equal(detail.revision, null)
      assert.deepEqual(detail.actions, [])
      assert.equal(gateway.act, undefined)
    },
  )
})

test('solicitações: perfil indisponível não gera nome ou endereço fictício', async () => {
  await fixture(
    (url) =>
      url.pathname.includes('/users/') ? new Response(null, { status: 404 }) : page([request()]),
    async ({ requests }) => {
      const result = await requests.createCoreRequestsResource().list(filters, signal())
      assert.equal(result.items[0].title, `Estabelecimento ${other}`)
      assert.equal(result.items[0].cells.address, 'Endereço indisponível')
    },
  )
})

test('agenda usa scheduledAt e não requestAt; não envia datas como filtro de criação', async () => {
  await fixture(
    (url) => (url.pathname.includes('/users/') ? Response.json(profile()) : page([request()], 100)),
    async ({ schedule }, calls) => {
      const gateway = schedule.createCoreScheduleGateway()
      const result = await gateway.calendar.list({ from: '2026-11-01', to: '2026-11-30' }, signal())
      assert.equal(result.events.length, 1)
      assert.equal(result.complete, true)
      assert.equal(result.events[0].revision, null)
      assert.equal(result.events[0].canReschedule, false)
      assert.equal(gateway.calendar.reschedule, undefined)
      const url = new URL(calls.find((call) => call.url.includes('/collection-requests?')).url)
      assert.equal(url.searchParams.get('status'), 'APPROVED')
      assert.equal(url.searchParams.has('from'), false)
      assert.equal(url.searchParams.has('until'), false)
    },
  )
})

test('consulta composta percorre todas as páginas e rejeita paginação inconsistente', async () => {
  let changed = false
  await fixture(
    (url) => {
      const index = Number(url.searchParams.get('page'))
      const items = Array.from({ length: index === 0 ? 100 : 1 }, (_, i) => ({
        id: `11111111-1111-4111-8111-${String(index * 100 + i).padStart(12, '0')}`,
      }))
      return page(items, 100, index, changed && index > 0 ? 102 : 101)
    },
    async ({ data }, calls) => {
      const result = await data.allPages(
        '/api/v1/admin/collection-requests',
        new URLSearchParams(),
        signal(),
      )
      assert.equal(result.length, 101)
      assert.equal(calls.filter((call) => call.url.includes('/collection-requests?')).length, 2)
      changed = true
      await assert.rejects(
        data.allPages('/api/v1/admin/collection-requests', new URLSearchParams(), signal()),
        /Página recebida|dados mudaram/,
      )
    },
  )
})

test('consulta composta recusa volume acima do limite sem retornar calendário parcial', async () => {
  await fixture(
    () =>
      page(
        Array.from({ length: 100 }, () => ({ id })),
        100,
        0,
        10001,
      ),
    async ({ data }) => {
      await assert.rejects(
        data.allPages('/api/v1/admin/collection-requests', new URLSearchParams(), signal()),
        /10.000 registros/,
      )
    },
  )
})

test('coletas: status vira recordStatus e anulação exige retorno da nova revisão', async () => {
  await fixture(
    (url, init) => {
      if (url.pathname.includes('/users/')) return Response.json(profile())
      if (init.method === 'POST')
        return Response.json({ collection: collection({ recordStatus: 'ANNULLED', revision: 3 }) })
      return page([collection()])
    },
    async ({ collections }, calls) => {
      const gateway = collections.createCoreCollectionsResource()
      await gateway.list({ ...filters, status: 'RECORDED' }, signal())
      const url = new URL(calls.find((call) => call.url.includes('/collections?')).url)
      assert.equal(url.searchParams.get('recordStatus'), 'RECORDED')
      await gateway.act(
        id,
        { action: 'annul', reason: 'Teste autorizado', expectedRevision: 2 },
        signal(),
      )
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), {
        justification: 'Teste autorizado',
        expectedRevision: 2,
      })
      assert.match(calls.at(-1).url, /\/annulments$/)
    },
  )
})

test('anulação não confirma sucesso se a resposta não trouxer estado e revisão esperados', async () => {
  await fixture(
    () => Response.json({ collection: collection() }),
    async ({ collections }) => {
      await assert.rejects(
        collections
          .createCoreCollectionsResource()
          .act(id, { action: 'annul', reason: 'Teste', expectedRevision: 2 }, signal()),
        /conferir a anulação/,
      )
    },
  )
})

test('relatórios usam agregado B2B e não incluem entregas B2C no volume', async () => {
  await fixture(
    () =>
      Response.json({
        collections: {
          count: 3,
          successful: 2,
          unsuccessful: 1,
          collectedVolumeLiters: 50,
          establishments: 2,
        },
        deliveries: { count: 10, acceptedVolumeLiters: 999 },
      }),
    async ({ reports }, calls) => {
      const result = await reports
        .createCoreAnalyticsGateway()
        .reports({ from: filters.from, to: filters.to }, signal())
      assert.equal(result.complete, true)
      assert.equal(result.charts.find((chart) => chart.unit === 'L').values[0].value, 50)
      assert.ok(calls.filter((call) => call.url.includes('/environmental-summary?')).length === 1)
    },
  )
})

test('catálogo é público e não inventa preço anual, benefícios ou destaque', async () => {
  await fixture(
    () =>
      Response.json([
        {
          id,
          name: 'Plano',
          description: null,
          monthlyPrice: 19.9,
          volumeLimitLiters: 100,
          collectionLimit: 2,
        },
      ]),
    async ({ settings }, calls) => {
      const result = await settings.createCoreSettingsGateway().plans.list(signal())
      assert.equal(calls.length, 1)
      assert.equal(calls[0].init.credentials, 'omit')
      assert.equal(calls[0].init.headers.Authorization, undefined)
      assert.equal(result[0].annualPrice, null)
      assert.equal(result[0].featured, false)
      assert.deepEqual(result[0].features, [])
      assert.equal(result[0].monthlyPrice, 19.9)
    },
    false,
  )
})

test('cancelamento de consulta é propagado pelo transporte', async () => {
  const controller = new AbortController()
  controller.abort()
  await fixture(
    (_url, init) => {
      init.signal.throwIfAborted()
    },
    async ({ settings }) => {
      await assert.rejects(settings.createCoreSettingsGateway().plans.list(controller.signal), {
        name: 'AbortError',
      })
    },
    false,
  )
})

test('dashboard conserva os indicadores originais com contagens e séries dos endpoints corretos', async () => {
  await fixture(
    (url) => {
      const size = Number(url.searchParams.get('size'))
      if (url.pathname.endsWith('/collection-requests')) {
        const status = url.searchParams.get('status')
        return page(
          [
            request({
              status,
              scheduledAt: status === 'APPROVED' ? new Date().toISOString() : null,
            }),
          ],
          size,
        )
      }
      return page([collection()], size)
    },
    async ({ reports }, calls) => {
      const result = await reports.coreDashboard(filters, signal())
      assert.deepEqual(
        result.metrics.map((item) => [item.id, item.value]),
        [
          ['pending', 1],
          ['today', 1],
          ['remaining', 1],
        ],
      )
      assert.deepEqual(
        result.charts.map((chart) => chart.id),
        ['liters', 'collections'],
      )
      assert.equal(
        result.charts[0].values.reduce((sum, item) => sum + item.value, 0),
        15,
      )
      assert.equal(
        result.charts[1].values.reduce((sum, item) => sum + item.value, 0),
        1,
      )
      assert.equal(
        calls.some((call) => call.url.includes('/environmental-summary')),
        false,
      )
      const queries = calls
        .filter((call) => call.url.includes('/collection-requests?'))
        .map((call) => new URL(call.url))
      assert.equal(
        queries
          .find((url) => url.searchParams.get('status') === 'PENDING')
          .searchParams.get('size'),
        '1',
      )
      assert.equal(
        queries.every((url) => !url.searchParams.has('from')),
        true,
      )
    },
  )
})
