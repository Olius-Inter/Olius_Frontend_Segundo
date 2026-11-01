import test from 'node:test'
import assert from 'node:assert/strict'
import { availableRequestActions, applyDemoRequestAction } from '../requestWorkflow.ts'
import { scheduleInputToIso, toScheduleInput } from '../../../shared/lib/scheduleInput.ts'

const pending = () => ({
  id: 'request-1',
  name: 'Empresa de teste',
  address: 'Endereço de teste',
  telephone: null,
  email: null,
  status: 'PENDING',
  requestedAt: '2026-10-28T09:00:00Z',
  scheduledAt: null,
  endsAt: null,
  estimatedLiters: 50,
  confirmedLiters: null,
  revision: 1,
  completed: false,
  history: [],
})
test('rejeitar e recuperar preserva pedido e histórico, sem aprovar automaticamente', () => {
  const original = pending()
  const rejected = applyDemoRequestAction(original, { action: 'reject', expectedRevision: 1 })
  assert.equal(rejected.status, 'REJECTED')
  assert.equal(original.status, 'PENDING')
  assert.deepEqual(availableRequestActions(rejected), ['restore'])
  const restored = applyDemoRequestAction(rejected, { action: 'restore', expectedRevision: 2 })
  assert.equal(restored.id, original.id)
  assert.equal(restored.status, 'PENDING')
  assert.equal(restored.scheduledAt, null)
  assert.equal(restored.history.length, 2)
  assert.equal(restored.revision, 3)
})
test('aprovar e editar agenda exigem um horário e preservam volume confirmado ausente', () => {
  const approved = applyDemoRequestAction(pending(), {
    action: 'approve',
    expectedRevision: 1,
    scheduledAt: '2026-10-29T12:00:00Z',
  })
  assert.equal(approved.status, 'APPROVED')
  assert.equal(approved.completed, false)
  assert.equal(approved.confirmedLiters, null)
  const changed = applyDemoRequestAction(approved, {
    action: 'reschedule',
    expectedRevision: 2,
    scheduledAt: '2026-10-30T12:00:00Z',
  })
  assert.equal(changed.scheduledAt, '2026-10-30T12:00:00Z')
  assert.match(changed.history[0].description, /2026-10-29/)
  assert.equal(changed.history.length, 2)
})
test('transições inválidas, falta de data e revisão antiga são recusadas', () => {
  assert.throws(() => applyDemoRequestAction(pending(), { action: 'restore', expectedRevision: 1 }))
  assert.throws(() => applyDemoRequestAction(pending(), { action: 'approve', expectedRevision: 1 }))
  assert.throws(() => applyDemoRequestAction(pending(), { action: 'reject', expectedRevision: 0 }))
  const rejected = applyDemoRequestAction(pending(), { action: 'reject', expectedRevision: 1 })
  assert.throws(() =>
    applyDemoRequestAction(rejected, {
      action: 'approve',
      expectedRevision: 2,
      scheduledAt: '2026-10-30T12:00:00Z',
    }),
  )
  assert.deepEqual(availableRequestActions({ ...pending(), completed: true }), [])
})
test('campo de horário rejeita datas inexistentes e conserva data/hora locais', () => {
  assert.equal(scheduleInputToIso('2026-02-30T10:00'), undefined)
  assert.equal(scheduleInputToIso(''), undefined)
  const input = '2026-10-29T10:30'
  assert.equal(toScheduleInput(scheduleInputToIso(input)), input)
})
