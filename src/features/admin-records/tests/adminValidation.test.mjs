import { requestListScope } from '../lib/requestListScope.ts'
import { adminResources } from '../data/adminResources.ts'
import { resolveAdminResource } from '../lib/adminNavigation.ts'
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
test('aprovação exige apenas data/hora programadas e revisão; PEV mantém regra própria', () => {
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
  assert.equal(
    validateAdminAction(
      detail,
      { action: 'approve', scheduledAt: '2026-10-29T13:00:00Z', expectedRevision: 1 },
      'requests',
    ),
    null,
  )
  assert.notEqual(
    validateAdminAction(
      detail,
      { action: 'approve', scheduledAt: 'invalid', expectedRevision: 1 },
      'requests',
    ),
    null,
  )
  assert.notEqual(
    validateAdminAction(
      detail,
      { action: 'approve', scheduledAt: '2026-10-29T13:00:00Z', expectedRevision: 2 },
      'requests',
    ),
    null,
  )
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

test('portal limita o público a empresas e remove recursos de cidadãos e entregas', () => {
  assert.equal('citizens' in adminResources, false)
  assert.equal('deliveries' in adminResources, false)
  assert.equal(validateAdminFilters({ ...defaultAdminFilters(), audience: 'CITIZENS' }), false)
  assert.equal(validateAdminFilters({ ...defaultAdminFilters(), audience: 'ESTABLISHMENT' }), true)
})

test('histórico oferece coletas empresariais e rejeitadas, sem resolver o público removido', () => {
  assert.equal(resolveAdminResource('operacao', 'historico', new URLSearchParams()), 'collections')
  assert.equal(
    resolveAdminResource('operacao', 'historico', new URLSearchParams('tipo=rejeitadas')),
    'requests',
  )
  assert.equal(resolveAdminResource('operacao', 'historico', new URLSearchParams('tipo=b2c')), null)
  assert.equal(resolveAdminResource('operacao', 'entregas', new URLSearchParams()), null)
})

test('fila fixa pendentes de qualquer período e mantém rejeitadas no histórico', () => {
  assert.deepEqual(requestListScope('requests', new URLSearchParams('status=APPROVED')), {
    status: 'PENDING',
    from: '',
    to: '',
  })
  assert.deepEqual(requestListScope('requests', new URLSearchParams('tipo=rejeitadas')), {
    status: 'REJECTED',
    from: '',
    to: '',
  })
  assert.equal(requestListScope('collections', new URLSearchParams()), null)
})

test('cartões recusam metadados de ação sem revisão válida', () => {
  const filters = defaultAdminFilters()
  const request = {
    status: 'PENDING',
    scheduledAt: null,
    email: null,
    telephone: null,
    revision: 1,
    actions: ['approve', 'reject'],
  }
  const row = { id: 'r1', title: 'Empresa', cells: { status: 'PENDING' }, request }
  const page = { items: [row], total: 1, page: 1, pageSize: 10, totalPages: 1 }
  assert.equal(validateAdminList(page, filters), true)
  assert.equal(
    validateAdminList(
      { ...page, items: [{ ...row, request: { ...request, revision: 0 } }] },
      filters,
    ),
    false,
  )
  assert.equal(
    validateAdminList(
      { ...page, items: [{ ...row, request: { ...request, actions: ['invented'] } }] },
      filters,
    ),
    false,
  )
})
