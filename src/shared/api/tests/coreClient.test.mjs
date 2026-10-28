import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let serial = 0
async function client() {
  const source = (await readFile(new URL('../coreClient.ts', import.meta.url), 'utf8')).replaceAll(
    'import.meta.env.VITE_API_BASE_URL',
    '"https://core.example.test"',
  )
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}#${serial++}`)
}
const access = () =>
  Response.json({
    accessToken: 'access-de-teste',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  })
const csrf = () => Response.json({ headerName: 'X-XSRF-TOKEN', token: 'csrf-de-teste' })

test('login usa CSRF; consulta protegida usa Bearer sem armazenar refresh', async () => {
  const previous = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    if (url.endsWith('/csrf')) return csrf()
    if (url.endsWith('/login')) return access()
    return Response.json({ ok: true })
  }
  try {
    const api = await client()
    await api.coreLogin({ email: 'admin@example.test', password: 'ficticia' })
    await api.coreRequest('/api/v1/users/me')
    assert.equal(calls[1].init.headers['X-XSRF-TOKEN'], 'csrf-de-teste')
    assert.equal(calls[1].init.credentials, 'include')
    assert.equal(calls[2].init.headers.Authorization, 'Bearer access-de-teste')
    assert.equal(calls[2].init.credentials, 'omit')
  } finally {
    globalThis.fetch = previous
  }
})
test('renovações concorrentes compartilham uma única rotação', async () => {
  const previous = globalThis.fetch
  let refreshes = 0
  globalThis.fetch = async (url) => {
    if (url.endsWith('/csrf')) return csrf()
    refreshes++
    return access()
  }
  try {
    const api = await client()
    await Promise.all([api.refreshAccess(), api.refreshAccess(), api.refreshAccess()])
    assert.equal(refreshes, 1)
  } finally {
    globalThis.fetch = previous
  }
})
test('logout usa cookie e CSRF sem renovar access token', async () => {
  const previous = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return url.endsWith('/csrf') ? csrf() : new Response(null, { status: 204 })
  }
  try {
    const api = await client()
    await api.coreLogout()
    assert.equal(calls.length, 2)
    assert.equal(calls[1].url.endsWith('/logout'), true)
    assert.equal(calls[1].init.headers.Authorization, undefined)
  } finally {
    globalThis.fetch = previous
  }
})
test('falha de refresh invalida acesso e não confirma sessão', async () => {
  const previous = globalThis.fetch
  globalThis.fetch = async (url) =>
    url.endsWith('/csrf') ? csrf() : new Response(null, { status: 401 })
  try {
    const api = await client()
    let invalid = false
    api.onSessionInvalid(() => {
      invalid = true
    })
    await assert.rejects(api.refreshAccess())
    assert.equal(invalid, true)
  } finally {
    globalThis.fetch = previous
  }
})
