import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AdminInvitation,
  AdminInvitationInput,
  InvitationAction,
} from '../types/adminInvitation'
import { adminInvitationGateway } from '../api/adminInvitationGateway'
import {
  changeAdminInvitation,
  createAdminInvitation,
  listAdminInvitations,
} from '../api/adminInvitationService'
import { validateInvitationInput } from '../validation/adminInvitationValidation'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import { useUnsavedForm } from '../../../shared/hooks/useUnsavedForm'

export function useAdminInvitations() {
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [revoking, setRevoking] = useState<AdminInvitation | null>(null)
  const [values, setValues] = useState<AdminInvitationInput>({ name: '', email: '' })
  const [feedback, setFeedback] = useState({ busy: false, error: '', notice: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  const loader = useCallback(
    (signal: AbortSignal) => listAdminInvitations({ page, pageSize: 10 }, signal),
    [page],
  )
  const resource = useAbortableResource(loader)
  useEffect(() => () => controller.current?.abort(), [])
  useUnsavedForm(open && Boolean(values.name || values.email))
  const close = () => {
    if (!lock.current) {
      setOpen(false)
      setRevoking(null)
      setValues({ name: '', email: '' })
      setFeedback((previous) => ({ ...previous, error: '' }))
    }
  }
  const run = async (operation: (signal: AbortSignal) => Promise<unknown>, notice: string) => {
    if (lock.current) return
    lock.current = true
    const request = new AbortController()
    controller.current = request
    setFeedback({ busy: true, error: '', notice: '' })
    try {
      await operation(request.signal)
      if (request.signal.aborted) return
      setOpen(false)
      setRevoking(null)
      setValues({ name: '', email: '' })
      setFeedback({ busy: false, error: '', notice })
      setPage(1)
      resource.reload()
    } catch (error: unknown) {
      if (!request.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível concluir a ação.',
          notice: '',
        })
    } finally {
      if (controller.current === request) lock.current = false
    }
  }
  const send = () => {
    const error = validateInvitationInput(values)
    if (error) {
      setFeedback({ busy: false, error, notice: '' })
      return
    }
    return run((signal) => createAdminInvitation(values, signal), 'Convite criado.')
  }
  const perform = (invitation: AdminInvitation, action: InvitationAction) => {
    if (lock.current) return
    if (action === 'REVOKE') {
      setRevoking(invitation)
      setFeedback({ busy: false, error: '', notice: '' })
      return
    }
    return run((signal) => changeAdminInvitation(invitation, action, signal), 'Convite reenviado.')
  }
  const revoke = () =>
    revoking
      ? run((signal) => changeAdminInvitation(revoking, 'REVOKE', signal), 'Convite revogado.')
      : undefined
  return {
    ...resource,
    page,
    setPage,
    open,
    show: () => {
      setOpen(true)
      setFeedback({ busy: false, error: '', notice: '' })
    },
    close,
    revoking,
    values,
    setValues,
    feedback,
    send,
    perform,
    revoke,
    canCreate: Boolean(adminInvitationGateway.create),
    canResend: Boolean(adminInvitationGateway.resend),
    canRevoke: Boolean(adminInvitationGateway.revoke),
  }
}
