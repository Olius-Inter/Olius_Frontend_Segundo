import { spawnSync } from 'node:child_process'
import { before, after, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { chromium, type Browser, type Page, type Locator } from 'playwright'
import {
  fixtureIds,
  fixtureDate,
  fixtureDriver,
  fixturePayload,
  type FixtureMode,
} from '../fixtures/core.ts'

type Options = { mode?: FixtureMode; failurePath?: string; anonymous?: boolean }
type Call = { path: string; method: string; body: unknown; headers: Record<string, string> }
let server: Server | undefined
let browser: Browser | undefined
let origin = ''

before(async () => {
  const build = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      'scripts/run-tool.ts',
      'vite',
      'build',
      '--outDir',
      'artifacts/core-integration-dist',
    ],
    {
      env: {
        ...process.env,
        VITE_API_BASE_URL: 'https://core.example.test',
        VITE_LOCAL_ADMIN_DEMO: 'false',
      },
      encoding: 'utf8',
      windowsHide: true,
    },
  )
  assert.equal(build.status, 0, build.stderr)
  const root = resolve('artifacts/core-integration-dist')
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
      if (!file.startsWith(root + sep)) {
        response.writeHead(403).end()
        return
      }
      const target = extname(file) ? file : resolve(root, 'index.html')
      const body = await readFile(target)
      const mime =
        (
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
          } as Record<string, string>
        )[extname(target)] ?? 'application/octet-stream'
      response.writeHead(200, { 'Content-Type': mime })
      response.end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise<void>((done) => server!.listen(0, '127.0.0.1', done))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  origin = `http://127.0.0.1:${address.port}`
  browser = await chromium.launch({
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    headless: true,
  })
})
after(async () => {
  await browser?.close()
  if (server?.listening)
    await new Promise<void>((done, fail) =>
      server!.close((error) => (error ? fail(error) : done())),
    )
})

async function visible(locator: Locator) {
  await locator.waitFor({ state: 'visible', timeout: 8000 })
  return locator
}
async function withPage(options: Options, run: (page: Page, calls: Call[]) => Promise<void>) {
  assert.ok(browser)
  const context = await browser.newContext()
  const calls: Call[] = []
  const errors: string[] = []
  const unsupported: string[] = []
  let anonymous = Boolean(options.anonymous)
  const access = () => ({
    accessToken: 'fixture-access',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  })
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (!url.pathname.startsWith('/api/v1/')) {
      if (url.origin === origin) await route.continue()
      else await route.abort()
      return
    }
    const method = route.request().method()
    const raw = route.request().postData()
    const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined
    calls.push({ path: url.pathname, method, body, headers: route.request().headers() })
    if (options.failurePath && url.pathname === options.failurePath) {
      await route.fulfill({ status: 503, body: '{}' })
      return
    }
    let result: unknown
    if (url.pathname.endsWith('/web/csrf'))
      result = { headerName: 'X-XSRF-TOKEN', token: 'fixture-csrf' }
    else if (url.pathname.endsWith('/web/refresh')) {
      if (anonymous) {
        await route.fulfill({ status: 401, body: '{}' })
        return
      }
      result = access()
    } else if (url.pathname.endsWith('/web/login')) {
      anonymous = false
      result = access()
    } else if (
      url.pathname.endsWith('/web/logout') ||
      url.pathname.endsWith('/admin-invitations/acceptance')
    ) {
      await route.fulfill({ status: 204 })
      return
    } else if (url.pathname === `/api/v1/admin/drivers/${fixtureIds.driver}` && method === 'PATCH')
      result = { ...fixtureDriver, ...body }
    else result = fixturePayload(url, options.mode ?? 'populated')
    if (result === undefined) {
      unsupported.push(url.pathname)
      await route.fulfill({ status: 404, body: '{}' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    })
  })
  const page = await context.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('dialog', (dialog) => dialog.accept())
  try {
    await run(page, calls)
    assert.deepEqual(errors, [], 'Erros de execução na página')
    assert.deepEqual(unsupported, [], 'Requisições não previstas no contrato')
  } finally {
    await context.close()
  }
}

const expectedIntegrated = async (page: Page) => {
  const content = await page.locator('main').innerText()
  assert.doesNotMatch(
    content,
    /Indicadores aguardando integração|Integração pendente|Agenda aguardando integração|Relatórios aguardando integração|Catálogo aguardando integração|Convites aguardando integração|Dados oficiais do período aguardando integração/,
  )
}

describe('Dados da Core no build de produção', () => {
  test('dashboard exibe todos os indicadores e gráficos, inclusive valores zero', async () => {
    for (const mode of ['populated', 'zero'] as const)
      await withPage({ mode }, async (page) => {
        await page.goto(origin)
        const metric = page
          .getByRole('link')
          .filter({ hasText: 'Visitas B2B no período' })
          .locator('strong')
        await visible(metric)
        assert.equal(await metric.textContent(), mode === 'zero' ? '0' : '2')
        assert.equal(
          await page
            .getByRole('link')
            .filter({ hasText: 'Litros recolhidos no período' })
            .locator('strong')
            .textContent(),
          mode === 'zero' ? '0 L' : '30,5 L',
        )
        assert.equal(
          await page
            .getByRole('heading', { name: 'Resultados B2B no período', exact: true })
            .count(),
          1,
        )
        assert.equal(
          await page
            .getByRole('heading', { name: 'Volume recolhido B2B no período', exact: true })
            .count(),
          1,
        )
        await expectedIntegrated(page)
      })
  })
  test('relatórios apresentam os totais e todas as séries retornadas', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/relatorios')
      await visible(page.getByRole('heading', { name: 'Resultado das visitas B2B no período' }))
      await visible(page.getByRole('heading', { name: 'Volume recolhido B2B no período' }))
      await page.getByText('Consultar valores do gráfico', { exact: true }).last().click()
      assert.match(await page.locator('main').innerText(), /30,5 L/)
      assert.doesNotMatch(await page.locator('main').innerText(), /999/)
      await expectedIntegrated(page)
    })
  })
  test('motoristas: colunas da lista, detalhe e formulário usam os campos reais', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/motoristas')
      await visible(page.getByRole('cell', { name: 'Condutor da Core', exact: true }))
      const cells = await page.locator('main tbody tr').first().locator('td').allTextContents()
      assert.deepEqual(cells.slice(0, 5), ['Condutor da Core', 'Ativo', '2', '47,25 L', '1'])
      await page.getByRole('button', { name: 'Abrir: Condutor da Core' }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByText('12345678901', { exact: true }))
      assert.match(await dialog.innerText(), /47,25 L/)
      assert.equal(await dialog.getByLabel('Motivo', { exact: true }).count(), 0)
      await dialog.getByRole('link', { name: 'Editar motorista' }).click()
      await visible(page.getByLabel('Nome', { exact: false }).first())
      assert.equal(await page.locator('#name').inputValue(), 'Condutor da Core')
      assert.equal(await page.locator('#cnh').inputValue(), '12345678901')
      assert.equal(await page.locator('#cpf').inputValue(), '***.***.***-25')
      assert.equal(await page.getByRole('button', { name: 'Salvar cadastro' }).isEnabled(), true)
      await expectedIntegrated(page)
    })
  })
  test('cadastro de motorista é conectado e não oferece edição de dados inexistentes', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/motoristas/novo')
      await visible(page.getByRole('heading', { name: 'Cadastrar motorista' }))
      assert.equal(await page.getByRole('button', { name: 'Salvar cadastro' }).isEnabled(), true)
      assert.equal(await page.locator('#name').getAttribute('maxlength'), '150')
      assert.equal(await page.locator('#status option[value=INACTIVE]').count(), 0)
      await expectedIntegrated(page)
    })
  })
  test('solicitações: nome, endereço, volume, contatos e situação chegam ao detalhe', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/operacao/solicitacoes')
      await visible(page.getByRole('heading', { name: 'Empresa da Core', exact: true }))
      assert.match(await page.locator('main').innerText(), /27,5 L/)
      assert.match(await page.locator('main').innerText(), /Rua da Core, 42/)
      await page.getByRole('button', { name: 'Consultar solicitação' }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByText('Observação da solicitação', { exact: true }))
      assert.match(await dialog.innerText(), /Pendente/)
      assert.equal(await dialog.getByRole('link', { name: 'empresa@example.test' }).count(), 1)
      assert.equal(await dialog.getByRole('button', { name: 'Aprovar coleta' }).count(), 0)
      await expectedIntegrated(page)
    })
  })
  test('histórico de rejeitadas conserva o estado real e não oferece recuperação sem endpoint', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/operacao/historico?tipo=rejeitadas')
      await visible(page.getByRole('cell', { name: 'Rejeitado', exact: true }))
      assert.equal(await page.getByRole('button', { name: 'Recuperar solicitação' }).count(), 0)
      await expectedIntegrated(page)
    })
  })
  test('agenda apresenta eventos pelo horário programado e detalhes de consulta', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/operacao/agenda')
      await visible(page.getByRole('button', { name: 'Lista', exact: true }))
      await page.getByRole('button', { name: 'Lista', exact: true }).click()
      await visible(page.getByRole('heading', { name: 'Empresa da Core', exact: true }))
      await page.getByRole('button', { name: 'Consultar visita', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByText('Esta visita está disponível somente para consulta.'))
      assert.match(await dialog.innerText(), /Rua da Core, 42/)
      assert.equal(await dialog.getByRole('button', { name: 'Confirmar reagendamento' }).count(), 0)
      assert.ok(await dialog.getByRole('link', { name: 'Abrir solicitação completa' }).count())
      await expectedIntegrated(page)
    })
  })
  test('coletas: lista, condições e cálculo mostram revisões e pontuações reais', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/operacao/historico')
      await visible(page.getByRole('cell', { name: '18,75 L', exact: true }))
      assert.ok(await page.getByRole('cell', { name: '20,5 L', exact: true }).count())
      await page.getByRole('button', { name: 'Abrir: Coleta — Empresa da Core' }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByRole('heading', { name: 'Cálculo vigente', exact: true }))
      assert.match(await dialog.innerText(), /Aceitável/)
      assert.match(await dialog.innerText(), /Observação da coleta/)
      assert.match(await dialog.innerText(), /Saldo anterior/)
      assert.ok(await dialog.getByText('-7', { exact: true }).count())
      assert.ok(await dialog.getByText('-4', { exact: true }).count())
      assert.ok(await dialog.getByText('-2', { exact: true }).count())
      await expectedIntegrated(page)
    })
  })
  test('planos: centavos, limites e detalhes são preservados sem preço anual fictício', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/configuracoes/planos')
      await visible(page.getByRole('heading', { name: 'Plano da Core', exact: true }))
      assert.match(await page.locator('main').innerText(), /19,90/)
      assert.match(await page.locator('main').innerText(), /100 L por ciclo/)
      assert.equal(
        await page.getByRole('button', { name: 'Anual', exact: true }).isEnabled(),
        false,
      )
      await page.getByRole('button', { name: 'Ver detalhes do plano' }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByText('Franquia por ciclo', { exact: true }))
      assert.match(await dialog.innerText(), /100 L/)
      assert.match(await dialog.innerText(), /19,90/)
      assert.ok(await dialog.getByText('2', { exact: true }).count())
      await expectedIntegrated(page)
    })
  })
  test('contas e convites apresentam identidade, quatro estados e validade', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/administracao/contas')
      await visible(page.getByRole('cell', { name: 'Convidado AVAILABLE', exact: true }))
      for (const state of ['Pendente', 'Aceito', 'Expirado', 'Revogado'])
        assert.ok(await page.getByRole('cell', { name: state, exact: true }).count())
      assert.ok(await page.getByRole('columnheader', { name: 'Validade', exact: true }).count())
      await page.getByLabel('Identificador da conta (UUID)').fill(fixtureIds.admin)
      await page.getByRole('button', { name: 'Consultar conta', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await visible(dialog.getByText('ADMIN', { exact: true }))
      assert.match(await dialog.innerText(), /Administrador da Core/)
      assert.match(await dialog.innerText(), /admin@example.test/)
      await expectedIntegrated(page)
    })
  })
  test('credenciamento de PEV mantém os dados do titular B2B e B2C', async () => {
    for (const [kind, type] of [
      ['b2b', 'ESTABLISHMENT'],
      ['b2c', 'CITIZENS'],
    ])
      await withPage({}, async (page) => {
        await page.goto(origin + `/operacao/solicitacoes?tipo=pev&titular=${kind}`)
        await visible(page.getByRole('heading', { name: `Responsável ${type}`, exact: true }))
        assert.match(await page.locator('main').innerText(), /Sala da Core/)
        assert.match(await page.locator('main').innerText(), /01001000/)
        await expectedIntegrated(page)
      })
  })
  test('perfil usa os dados da sessão e mantém ações sem contrato desabilitadas', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/configuracoes/perfil')
      await visible(page.getByLabel('Nome', { exact: true }))
      assert.equal(
        await page.getByLabel('Nome', { exact: true }).inputValue(),
        'Administrador da Core',
      )
      assert.equal(
        await page.getByLabel('E-mail', { exact: true }).inputValue(),
        'admin@example.test',
      )
      assert.equal(await page.getByLabel('Telefone', { exact: true }).inputValue(), '11912345678')
      assert.equal(await page.getByRole('button', { name: 'Salvar perfil' }).isEnabled(), false)
    })
  })
  test('aparência e acessibilidade continuam funcionando com sessão da Core', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/configuracoes/aparencia')
      await visible(page.getByRole('heading', { name: 'Aparência', exact: true }))
      await page.getByRole('button', { name: 'Escuro', exact: true }).click()
      assert.equal(
        await page
          .getByRole('button', { name: 'Escuro', exact: true })
          .getAttribute('aria-pressed'),
        'true',
      )
      await page.goto(origin + '/configuracoes/acessibilidade')
      await visible(page.getByRole('heading', { name: 'Acessibilidade', exact: true }))
    })
  })
  test('aceite público usa apenas token e senha, sem sessão ou prévia fictícia', async () => {
    await withPage({ anonymous: true }, async (page, calls) => {
      const token = 'a'.repeat(43)
      await page.goto(origin + '/convites/aceitar#token=' + token)
      await visible(page.getByLabel('Senha', { exact: true }))
      await page.getByLabel('Senha', { exact: true }).fill('Fixture123!')
      await page.getByLabel('Confirmação de senha', { exact: true }).fill('Fixture123!')
      await page.getByRole('button', { name: 'Aceitar convite', exact: true }).click()
      await visible(page.getByRole('heading', { name: 'Convite aceito', exact: true }))
      const acceptance = calls.find((call) => call.path.endsWith('/admin-invitations/acceptance'))
      assert.deepEqual(acceptance?.body, { token, password: 'Fixture123!' })
      assert.equal(acceptance?.headers.authorization, undefined)
      assert.equal(
        calls.some((call) => call.path.endsWith('/web/refresh')),
        false,
      )
      assert.ok(!page.url().includes(token))
    })
  })
  test('login real usa a Core e redireciona para os indicadores', async () => {
    await withPage({ anonymous: true }, async (page, calls) => {
      await page.goto(origin + '/login')
      await visible(page.getByLabel('E-mail', { exact: true }))
      await page.getByLabel('E-mail', { exact: true }).fill('admin@example.test')
      await page.getByLabel('Senha', { exact: true }).fill('Fixture123!')
      await page.getByRole('button', { name: 'Entrar', exact: true }).click()
      await visible(page.getByRole('link').filter({ hasText: 'Visitas B2B no período' }))
      assert.ok(calls.some((call) => call.path.endsWith('/web/login')))
    })
  })
  test('aliases de navegação continuam abrindo as páginas atuais', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/resultados/relatorios')
      await visible(page.getByRole('heading', { name: 'Resultado das visitas B2B no período' }))
      assert.equal(new URL(page.url()).pathname, '/relatorios')
      await page.goto(origin + `/cadastros/motoristas/${fixtureIds.driver}`)
      await visible(page.getByRole('dialog').getByText('12345678901', { exact: true }))
      assert.equal(new URL(page.url()).pathname, '/motoristas')
    })
  })
})

describe('Estados vazios e erros não se confundem com integração pendente', () => {
  for (const [path, text] of [
    ['/motoristas', 'Nenhum resultado'],
    ['/operacao/solicitacoes', 'Nenhuma solicitação pendente'],
    ['/operacao/historico', 'Nenhum resultado'],
    ['/configuracoes/planos', 'Nenhum plano ativo retornado.'],
    ['/administracao/contas', 'Nenhum convite encontrado.'],
    ['/operacao/solicitacoes?tipo=pev', 'Nenhum pedido pendente'],
  ])
    test(`resposta vazia em ${path}`, async () => {
      await withPage({ mode: 'empty' }, async (page) => {
        await page.goto(origin + path)
        await visible(page.getByText(text, { exact: true }))
        await expectedIntegrated(page)
      })
    })
  for (const [path, endpoint, title] of [
    ['/', '/api/v1/admin/environmental-summary', 'Falha ao carregar indicadores'],
    [
      '/relatorios',
      '/api/v1/admin/environmental-summary',
      'Não foi possível consultar os relatórios',
    ],
    ['/motoristas', '/api/v1/admin/drivers', 'Não foi possível carregar a consulta'],
    [
      '/operacao/solicitacoes',
      '/api/v1/admin/collection-requests',
      'Não foi possível carregar a consulta',
    ],
    [
      '/operacao/agenda',
      '/api/v1/admin/collection-requests',
      'Não foi possível consultar a agenda',
    ],
    ['/operacao/historico', '/api/v1/admin/collections', 'Não foi possível carregar a consulta'],
    ['/configuracoes/planos', '/api/v1/subscription-plans', 'Não foi possível consultar os planos'],
    [
      '/administracao/contas',
      '/api/v1/admin/invitations',
      'Não foi possível consultar os convites',
    ],
  ])
    test(`erro HTTP em ${path}`, async () => {
      await withPage({ failurePath: endpoint }, async (page) => {
        await page.goto(origin + path)
        await visible(page.getByRole('heading', { name: title, exact: true }))
        await expectedIntegrated(page)
        if (path === '/')
          assert.equal(
            await page.getByRole('region', { name: 'Indicadores operacionais' }).count(),
            0,
          )
      })
    })
  test('notificações e auditoria sem endpoint mantêm a indisponibilidade explícita', async () => {
    await withPage({}, async (page) => {
      await page.goto(origin + '/notificacoes')
      await visible(
        page.getByRole('heading', { name: 'Notificações aguardando integração', exact: true }),
      )
      await page.goto(origin + '/administracao/auditoria')
      await visible(page.getByRole('heading', { name: 'Integração pendente', exact: true }))
    })
  })
})
