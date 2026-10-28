import { useEffect, useRef, useState } from 'react'
import type { AdminAccountsProps, ManagedUser } from '../../auth/contracts'
import { getManagedUser, setManagedUserStatus } from '../api/adminAccountService'
import { useAuth } from '../../auth'

export function useAdminAccounts(expectedType: AdminAccountsProps['expectedType']) {
  const [lookup, setLookup] = useState('')
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [user, setUser] = useState<ManagedUser | null>(null)
  const [feedback, setFeedback] = useState({ busy: false, error: '', success: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  const { state, logout } = useAuth()
  useEffect(() => () => controller.current?.abort(), [])
  const remember = (value: ManagedUser) =>
    setUsers((previous) => [...previous.filter((item) => item.id !== value.id), value])
  const close = () => {
    if (!lock.current) {
      setUser(null)
      setFeedback((previous) => ({ ...previous, error: '' }))
    }
  }
  const run = async (operation: (signal: AbortSignal) => Promise<string>) => {
    if (lock.current) return
    lock.current = true
    const request = new AbortController()
    controller.current = request
    setFeedback({ busy: true, error: '', success: '' })
    try {
      const message = await operation(request.signal)
      if (!request.signal.aborted) setFeedback({ busy: false, error: '', success: message })
    } catch (error: unknown) {
      if (!request.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível concluir a operação.',
          success: '',
        })
    } finally {
      if (controller.current === request) lock.current = false
    }
  }
  const consult = (id = lookup.trim()) =>
    run(async (signal) => {
      const found = await getManagedUser(id, signal)
      if (expectedType && found.userType !== expectedType)
        throw new Error('O registro não pertence ao perfil desta consulta.')
      if (!signal.aborted) {
        remember(found)
        setUser(found)
      }
      return ''
    })
  const toggleStatus = () => {
    if (!user) return
    const status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    if (
      !window.confirm(
        status === 'INACTIVE' ? 'Inativar a conta e revogar suas sessões?' : 'Reativar a conta?',
      )
    )
      return
    return run(async (signal) => {
      await setManagedUserStatus(user.id, status, signal)
      if (state.phase === 'ready' && user.id === state.user.id && status === 'INACTIVE') {
        await logout()
        return 'Sua conta foi inativada.'
      }
      if (!signal.aborted) {
        remember({ ...user, status })
        setUser(null)
      }
      return 'Situação da conta atualizada.'
    })
  }
  return { lookup, setLookup, users, user, close, feedback, consult, toggleStatus }
}
