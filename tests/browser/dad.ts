import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const origin = process.env.OLIUS_TEST_URL || 'http://127.0.0.1:5190'
const output = 'artifacts/dad'
const server = process.env.OLIUS_TEST_URL
  ? null
  : spawn(
      process.execPath,
      [
        '--experimental-strip-types',
        'scripts/run-tool.ts',
        'vite',
        '--host',
        '127.0.0.1',
        '--port',
        '5190',
        '--strictPort',
      ],
      { env: { ...process.env, VITE_LOCAL_ADMIN_DEMO: 'true' }, windowsHide: true, stdio: 'pipe' },
    )
const results = {
  scans: [],
  keyboard: [],
  network: {},
  profiler: {},
  externalRequests: [],
  pageErrors: [],
}
let browser
try {
  await mkdir(output, { recursive: true })
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(origin)).ok) break
    } catch {}
    if (attempt === 99) throw new Error('A prévia local não iniciou.')
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  browser = await chromium.launch({
    ...(process.env.OLIUS_BROWSER
      ? { channel: process.env.OLIUS_BROWSER }
      : process.platform === 'win32'
        ? { channel: 'msedge' }
        : {}),
    headless: true,
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.route('**/*', (route) => {
    if (
      route
        .request()
        .url()
        .startsWith(origin + '/')
    )
      return route.continue()
    results.externalRequests.push(route.request().url())
    return route.abort()
  })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  page.on('pageerror', (error) => results.pageErrors.push(error.message))
  const requests = []
  page.on('request', (request) => requests.push(new URL(request.url()).pathname))
  const go = async (href) => {
    await page.locator(`a[href="${href}"]:visible`).first().click()
    await page.waitForURL(
      (url) =>
        url.pathname === href || (href === '/operacao' && url.pathname.startsWith('/operacao/')),
    )
    const heading = href.startsWith('/configuracoes/')
      ? 'Configurações'
      : {
          '/': 'Visão geral',
          '/motoristas': 'Motorista',
          '/operacao': 'Operação',
          '/operacao/agenda': 'Agenda de coletas',
          '/relatorios': 'Relatórios',
        }[href]
    await page.getByRole('heading', { name: heading, level: 1, exact: true }).waitFor()
  }
  const scan = async (name) => {
    const report = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    results.scans.push({
      name,
      violations: report.violations,
      incomplete: report.incomplete.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
    })
    console.log(`${name}: ${report.violations.length} violações automáticas.`)
  }
  await page.goto(origin + '/login')
  await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor()
  await scan('Login')
  await page.getByLabel('E-mail', { exact: true }).fill('admin@olius.test')
  await page.getByLabel('Senha', { exact: true }).fill('OliusTeste123!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.getByRole('heading', { name: 'Visão geral', exact: true }).waitFor()
  const reportsModule = '/src/pages/AdminReportsPage/index.tsx'
  results.network.beforeReports = requests.filter((name) => name === reportsModule).length
  assert.equal(results.network.beforeReports, 0)
  await go('/relatorios')
  results.network.afterReports = requests.filter((name) => name === reportsModule).length
  assert.equal(results.network.afterReports, 1)
  results.network.reportModule = reportsModule

  for (const mode of ['light', 'dark', 'high']) {
    await go('/configuracoes/perfil')
    await go('/configuracoes/aparencia')
    await page
      .getByRole('button', { name: mode === 'light' ? 'Claro' : 'Escuro', exact: true })
      .click()
    if (mode === 'high') {
      await go('/configuracoes/acessibilidade')
      await page.getByRole('switch', { name: /Alto contraste/ }).check()
    }
    await page.waitForFunction(
      (expected) =>
        expected === 'high'
          ? document.documentElement.dataset.contrast === 'high'
          : document.documentElement.dataset.theme === expected,
      mode,
    )
    for (const href of [
      '/',
      '/motoristas',
      '/operacao',
      '/operacao/agenda',
      '/relatorios',
      '/configuracoes/perfil',
      '/configuracoes/aparencia',
      '/configuracoes/acessibilidade',
      '/configuracoes/planos',
    ]) {
      await go(href)
      await scan(`${mode} ${href}`)
    }
    await go('/motoristas')
    await page.getByRole('link', { name: 'Cadastrar motorista', exact: true }).click()
    await page.getByRole('button', { name: 'Validar campos', exact: true }).click()
    await scan(`${mode} formulario-invalido`)
    await go('/configuracoes/perfil')
    await go('/configuracoes/planos')
  }
  await page.reload()
  await page.locator('main h1').first().waitFor()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.contrast), 'high')
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('olius:portal-preferences')).contrast,
    ),
    true,
  )
  results.context = 'Preferência propagada pelo Context e preservada após recarregar a página.'
  await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor()
  {
    await page.getByLabel('E-mail', { exact: true }).fill('admin@olius.test')
    await page.getByLabel('Senha', { exact: true }).fill('OliusTeste123!')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  }
  await go('/configuracoes/perfil')
  await go('/configuracoes/planos')
  const checkDialog = async (trigger, name) => {
    await trigger.focus()
    await trigger.press('Enter')
    const dialog = page.locator('dialog[open]')
    await dialog.waitFor()
    await scan(name)
    await writeFile(`${output}/${name}.aria.yml`, await dialog.ariaSnapshot())
    assert.equal(
      await dialog.evaluate((node) => node.contains(document.activeElement)),
      true,
      name + ': foco inicial',
    )
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press(index % 2 ? 'Shift+Tab' : 'Tab')
      assert.equal(
        await dialog.evaluate((node) => node.contains(document.activeElement)),
        true,
        name + ': foco contido',
      )
    }
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(
      await trigger.evaluate((node) => node === document.activeElement),
      true,
      name + ': devolução do foco',
    )
    results.keyboard.push(name + ': Enter, Tab, Shift+Tab, Escape e retorno do foco passaram.')
  }
  await checkDialog(
    page.getByRole('button', { name: 'Ver detalhes do plano', exact: true }).first(),
    'modal-planos',
  )
  await go('/motoristas')
  await checkDialog(page.locator('main tbody button').first(), 'modal-registro')
  await go('/operacao')
  await go('/operacao/agenda')
  await checkDialog(page.locator('main button:has(time)').first(), 'modal-agenda')
  const notifications = page.getByRole('button', { name: /^Notificações/ }).first()
  await notifications.focus()
  await notifications.press('Enter')
  await page.getByRole('dialog', { name: 'Notificações', exact: true }).waitFor()
  await scan('notificacoes-abertas')
  await page.keyboard.press('Escape')
  assert.equal(await notifications.evaluate((node) => node === document.activeElement), true)
  results.keyboard.push('Notificações: abertura por teclado e retorno por Escape passaram.')

  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.getByRole('button', { name: 'Abrir menu', exact: true })
  await menu.focus()
  await menu.press('Enter')
  const navigation = page.getByRole('dialog', { name: 'Menu de navegação', exact: true })
  await navigation.waitFor()
  await scan('menu-movel-aberto')
  for (let index = 0; index < 18; index++) {
    await page.keyboard.press('Tab')
    assert.equal(await navigation.evaluate((node) => node.contains(document.activeElement)), true)
  }
  await page.keyboard.press('Escape')
  await navigation.waitFor({ state: 'hidden' })
  assert.equal(await menu.evaluate((node) => node === document.activeElement), true)
  results.keyboard.push('Menu móvel: foco contido, Escape e retorno ao acionador passaram.')
  await scan('mobile-390px')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.setViewportSize({ width: 1440, height: 1000 })

  await go('/motoristas')
  await page.getByRole('link', { name: 'Cadastrar motorista', exact: true }).click()
  await page.getByRole('button', { name: 'Validar campos', exact: true }).click()
  await page.getByText('Revise os campos indicados antes de continuar.', { exact: true }).waitFor()
  await page.locator('#name').fill('Motorista de apresentação')
  await page.locator('#cpf').fill('52998224725')
  await page.locator('#cnh').fill('84721603955')
  await page.getByRole('button', { name: 'Validar campos', exact: true }).click()
  await page
    .getByText('Os campos estão válidos. Nenhum dado foi enviado ou salvo.', { exact: true })
    .waitFor()
  await page.locator('#name').fill('Outro motorista')
  assert.equal(
    await page
      .getByText('Os campos estão válidos. Nenhum dado foi enviado ou salvo.', { exact: true })
      .count(),
    0,
  )
  results.reducer = 'invalid → valid → editing demonstrado no formulário real, sem salvar dados.'
  await scan('formulario-motorista')

  const demo = await context.newPage()
  demo.on('pageerror', (error) => results.pageErrors.push(error.message))
  await demo.goto(origin + '/demo/desempenho.html')
  await demo.getByRole('heading', { name: 'Comparação no Profiler' }).waitFor()
  await demo.getByRole('button', { name: 'Limpar medições' }).click()
  for (let index = 0; index < 20; index++)
    await demo.getByRole('button', { name: 'Atualizar contador' }).click()
  const samples = await demo.evaluate(() => window.oliusProfilerSamples)
  const median = (items) => [...items].sort((a, b) => a - b)[Math.floor(items.length / 2)] ?? null
  results.profiler = {
    iterations: 20,
    baselineMedianMs: median(
      samples
        .filter((s) => s.id === 'sem-memo' && s.phase === 'update')
        .map((s) => s.actualDuration),
    ),
    optimizedMedianMs: median(
      samples
        .filter((s) => s.id === 'com-memo' && s.phase === 'update')
        .map((s) => s.actualDuration),
    ),
    baselineListUpdates: samples.filter((s) => s.id === 'lista-sem-memo' && s.phase === 'update')
      .length,
    optimizedListUpdates: samples.filter((s) => s.id === 'lista-com-memo' && s.phase === 'update')
      .length,
    samples,
  }
  assert.equal(results.profiler.baselineListUpdates, 20)
  assert.equal(results.profiler.optimizedListUpdates, 0)
  await demo.getByLabel('Filtrar nomes').fill('Motorista 0001')
  const changedSamples = await demo.evaluate(() => window.oliusProfilerSamples)
  assert.ok(
    changedSamples.some((sample) => sample.id === 'lista-com-memo' && sample.phase === 'update'),
  )
  await writeFile(`${output}/profiler.json`, JSON.stringify(results.profiler, null, 2))
  await writeFile(`${output}/resultado.json`, JSON.stringify(results, null, 2))
  console.log('Profiler:', JSON.stringify({ ...results.profiler, samples: undefined }))
  const violations = results.scans.flatMap((scan) =>
    scan.violations.map((item) => ({ page: scan.name, id: item.id })),
  )
  assert.deepEqual(violations, [])
  assert.deepEqual(results.pageErrors, [])
  assert.deepEqual(
    results.externalRequests.filter((url) => !/fonts\.(googleapis|gstatic)\.com/.test(url)),
    [],
  )
  console.log(
    `Concluído: ${results.scans.length} cenários de acessibilidade, teclado, Network, Context, reducer e Profiler.`,
  )
} finally {
  if (browser) await browser.close()
  if (server) server.kill()
  await writeFile(`${output}/resultado-parcial.json`, JSON.stringify(results, null, 2))
}
