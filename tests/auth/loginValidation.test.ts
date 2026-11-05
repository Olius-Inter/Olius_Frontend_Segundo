import test from 'node:test'
import assert from 'node:assert/strict'
import {
  sanitizeLoginInput,
  validateLogin,
  loginReturnPath,
} from '../../src/utils/auth/loginValidation.ts'

test('login valida e-mail e senha vazios com mensagens separadas', () => {
  const errors = validateLogin(sanitizeLoginInput({ email: '   ', password: '' }))
  assert.ok(errors.email)
  assert.ok(errors.password)
})
test('normaliza somente espaços externos do e-mail e preserva a senha exata', () => {
  const input = { email: '  Admin@empresa.test  ', password: ' senha com espaços ' }
  const clean = sanitizeLoginInput(input)
  assert.deepEqual(clean, { email: 'Admin@empresa.test', password: input.password })
  assert.deepEqual(validateLogin(clean), {})
  assert.equal(input.email, '  Admin@empresa.test  ')
})
test('login aceita senha existente sem impor política de cadastro', () => {
  assert.deepEqual(validateLogin({ email: 'a@b.test', password: 'a' }), {})
})
test('rejeita formato de e-mail e limites de comprimento inválidos', () => {
  assert.ok(validateLogin({ email: 'email-invalido', password: 'valida' }).email)
  assert.ok(validateLogin({ email: 'a'.repeat(250) + '@b.test', password: 'valida' }).email)
  assert.ok(validateLogin({ email: 'a@b.test', password: 'a'.repeat(257) }).password)
  assert.deepEqual(validateLogin({ email: 'a@b.test', password: 'a'.repeat(256) }), {})
})
test('retorno de login mantém somente caminhos internos seguros', () => {
  assert.equal(loginReturnPath('/motoristas?page=2'), '/motoristas?page=2')
  for (const value of [
    null,
    {},
    'https://externo.test',
    '//externo.test',
    '/login',
    '/login?from=x',
    '/\\externo.test',
    '/\nexterno',
  ])
    assert.equal(loginReturnPath(value), '/')
})
