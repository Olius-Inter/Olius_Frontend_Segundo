import { validDate } from '../../../shared/lib/validDate.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultAdminFilters,
  validateAdminFilters,
  validateAdminAction,
  validateAdminList,
} from '../validation/adminValidation.ts'
import {
  isActiveAdmin,
  readManagedUser,
  validateAdminRegistration,
} from '../../auth/validation/validateAdminIdentity.ts'

test('valida período real e rejeita paginação inválida', () => {
  const filters = defaultAdminFilters()
  assert.equal(validateAdminFilters(filters), true)
  assert.equal(validDate('2026-02-30'), false)
  assert.equal(validateAdminFilters({ ...filters, from: '2026-10-20', to: '2026-10-01' }), false)
  assert.equal(validateAdminFilters({ ...filters, page: 0 }), false)
})
test('aprovação de solicitação exige horário combinado; PEV não usa agenda', () => {
  const detail = {
    id: 'a',
    title: '',
    revision: 1,
    sections: [],
    history: [],
    actions: ['approve'],
  }
  const input = { action: 'approve', reason: 'Conferido pelo administrador' }
  assert.notEqual(validateAdminAction(detail, input, 'requests'), null)
  assert.equal(validateAdminAction(detail, input, 'pevs'), null)
})
test('ação não autorizada e revisão antiga são recusadas', () => {
  const detail = { id: 'a', title: '', revision: 3, sections: [], history: [], actions: ['annul'] }
  assert.notEqual(
    validateAdminAction(detail, { action: 'cancel', reason: 'Motivo' }, 'collections'),
    null,
  )
  assert.notEqual(
    validateAdminAction(
      detail,
      { action: 'annul', reason: 'Motivo', expectedRevision: 2 },
      'collections',
    ),
    null,
  )
  assert.equal(
    validateAdminAction(
      detail,
      { action: 'annul', reason: 'Motivo', expectedRevision: 3 },
      'collections',
    ),
    null,
  )
})
test('totais paginados e identificadores duplicados não passam', () => {
  const filters = defaultAdminFilters()
  assert.equal(
    validateAdminList({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }, filters),
    true,
  )
  const row = { id: 'x', title: 'X', cells: {} }
  assert.equal(
    validateAdminList(
      { items: [row, row], total: 2, page: 1, pageSize: 10, totalPages: 1 },
      filters,
    ),
    false,
  )
  assert.equal(validateAdminList(null, filters), false)
  assert.equal(validateAdminList({ items: [null] }, filters), false)
})
test('perfil administrativo descarta tokens e dados não necessários', () => {
  const user = readManagedUser({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Administrador',
    email: 'admin@example.test',
    userType: 'ADMIN',
    status: 'ACTIVE',
    qrToken: 'nao-expor',
    passwordHash: 'nao-expor',
  })
  assert.equal('qrToken' in user, false)
  assert.equal('passwordHash' in user, false)
  assert.equal(isActiveAdmin(user), true)
  assert.equal(isActiveAdmin({ ...user, userType: 'ESTABLISHMENT' }), false)
  assert.equal(isActiveAdmin({ ...user, userType: 'CITIZENS' }), false)
  assert.equal(isActiveAdmin({ ...user, status: 'INACTIVE' }), false)
  assert.equal(
    validateAdminRegistration({
      name: 'Admin',
      email: 'admin@example.test',
      password: 'Exemplo123!',
    }),
    null,
  )
  assert.notEqual(
    validateAdminRegistration({ name: 'Admin', email: 'admin@example.test', password: 'curta' }),
    null,
  )
})
