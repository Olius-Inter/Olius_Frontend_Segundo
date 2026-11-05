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
      const dependency = spec.endsWith('/modules/auth')
        ? new URL('../../src/utils/auth/validateAdminIdentity.ts', import.meta.url)
        : new URL(spec.endsWith('.ts') ? spec : `${spec}.ts`, file)
      output = output.replace(match[0], `from '${await load(dependency)}'`)
    }
    const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}#${version}`
    cache.set(file.href, url)
    return url
  }
  const core = await import(
    await load(new URL('../../src/services/coreClient.ts', import.meta.url))
  )
  const gateway = await import(
    await load(
      new URL('../../src/services/invitations/coreAdminInvitationGateway.ts', import.meta.url),
    )
  )
  return { core, gateway: gateway.createCoreAdminInvitationGateway() }
}
const id = '11111111-1111-4111-8111-111111111111'
const nextId = '22222222-2222-4222-8222-222222222222'
const item = (state = 'AVAILABLE', uuid = id) => ({
  id: uuid,
  name: 'Administrador',
  email: 'admin@example.test',
  state,
  expiresAt: '2030-01-01T00:00:00Z',
})
async function fixture(handler, run) {
  const previous = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    if (url.endsWith('/csrf')) return Response.json({ headerName: 'X-XSRF-TOKEN', token: 'csrf' })
    if (url.endsWith('/web/login'))
      return Response.json({
        accessToken: 'fixture-access',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 900000).toISOString(),
      })
    return handler(url, init)
  }
  try {
    await run(await modules(), calls)
  } finally {
    globalThis.fetch = previous
  }
}

test('lista real converte página, total e estados sem transmitir cookies', async () => {
  await fixture(
    () =>
      Response.json({
        items: [item(), item('EXPIRED', nextId)],
        page: 1,
        size: 10,
        totalElements: 12,
      }),
    async ({ core, gateway }, calls) => {
      await core.coreLogin({ email: 'admin@example.test', password: 'fixture' })
      const result = await gateway.list({ page: 2, pageSize: 10 }, new AbortController().signal)
      assert.equal(result.totalPages, 2)
      assert.equal(result.total, 12)
      assert.equal(result.items[0].status, 'PENDING')
      assert.deepEqual(result.items[0].allowedActions, ['RESEND', 'REVOKE'])
      assert.deepEqual(result.items[1].allowedActions, ['RESEND'])
      assert.match(calls.at(-1).url, /page=1&size=10$/)
      assert.equal(calls.at(-1).init.headers.Authorization, 'Bearer fixture-access')
      assert.equal(calls.at(-1).init.credentials, 'omit')
    },
  )
})

test('reenvio consulta o convite e emite outro; revogação confirma o estado após 204', async () => {
  let revoked = false
  await fixture(
    (url, init) => {
      if (url.endsWith('/revocation')) {
        revoked = true
        return new Response(null, { status: 204 })
      }
      if (init.method === 'POST') return Response.json(item('AVAILABLE', nextId), { status: 201 })
      return Response.json(item(revoked ? 'REVOKED' : 'AVAILABLE'))
    },
    async ({ core, gateway }, calls) => {
      await core.coreLogin({ email: 'admin@example.test', password: 'fixture' })
      const signal = new AbortController().signal
      const resent = await gateway.resend(id, signal)
      assert.equal(resent.id, nextId)
      assert.deepEqual(JSON.parse(calls.at(-1).init.body), {
        name: 'Administrador',
        email: 'admin@example.test',
      })
      const result = await gateway.revoke(id, signal)
      assert.equal(result.status, 'REVOKED')
      assert.deepEqual(result.allowedActions, [])
      assert.match(calls.at(-2).url, /\/revocation$/)
      assert.match(calls.at(-1).url, new RegExp(`${id}$`))
    },
  )
})

test('aceite público projeta token e senha sem login, Bearer, cookies ou CSRF', async () => {
  await fixture(
    () => new Response(null, { status: 204 }),
    async ({ gateway }, calls) => {
      await gateway.accept(
        { token: 'x'.repeat(43), password: 'Fixture123!', confirmation: 'não enviar' },
        new AbortController().signal,
      )
      assert.equal(calls.length, 1)
      assert.match(calls[0].url, /\/auth\/admin-invitations\/acceptance$/)
      assert.equal(calls[0].init.credentials, 'omit')
      assert.equal(calls[0].init.headers.Authorization, undefined)
      assert.equal(calls[0].init.headers['X-XSRF-TOKEN'], undefined)
      assert.deepEqual(JSON.parse(calls[0].init.body), {
        token: 'x'.repeat(43),
        password: 'Fixture123!',
      })
    },
  )
})

test('convite inválido exibe erro específico e não é reenviado automaticamente', async () => {
  await fixture(
    () => new Response(null, { status: 409 }),
    async ({ gateway }, calls) => {
      await assert.rejects(
        gateway.accept(
          { token: 'x'.repeat(43), password: 'Fixture123!' },
          new AbortController().signal,
        ),
        /inválido, expirou ou já foi utilizado/,
      )
      assert.equal(calls.length, 1)
    },
  )
})

test('falha de entrega não repete emissão e orienta consultar a lista', async () => {
  await fixture(
    () => new Response(null, { status: 503 }),
    async ({ core, gateway }, calls) => {
      await core.coreLogin({ email: 'admin@example.test', password: 'fixture' })
      await assert.rejects(
        gateway.create(
          { name: 'Administrador', email: 'admin@example.test' },
          new AbortController().signal,
        ),
        /Consulte a lista antes de reenviar/,
      )
      assert.equal(calls.filter((call) => call.url.endsWith('/admin/invitations')).length, 1)
    },
  )
})

test('resposta com página incompatível ou estado desconhecido é rejeitada', async () => {
  let malformed = false
  await fixture(
    () =>
      Response.json({
        items: [item(malformed ? 'UNKNOWN' : 'AVAILABLE')],
        page: malformed ? 0 : 4,
        size: 10,
        totalElements: 1,
      }),
    async ({ core, gateway }) => {
      await core.coreLogin({ email: 'admin@example.test', password: 'fixture' })
      await assert.rejects(
        gateway.list({ page: 1, pageSize: 10 }, new AbortController().signal),
        /Página de convites inválida/,
      )
      malformed = true
      await assert.rejects(
        gateway.list({ page: 1, pageSize: 10 }, new AbortController().signal),
        /Situação de convite inválida/,
      )
    },
  )
})
