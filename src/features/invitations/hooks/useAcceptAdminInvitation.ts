import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { InvitationPasswordValues } from '../types/adminInvitation'
import { acceptAdminInvitation, inspectAdminInvitation } from '../api/adminInvitationService'
import { adminInvitationGateway } from '../api/adminInvitationGateway'
import {
  readInvitationToken,
  validateInvitationPasswords,
} from '../validation/adminInvitationValidation'
import { useAbortableResource } from '../../../shared/hooks/useAbortableResource'
import { useUnsavedForm } from '../../../shared/hooks/useUnsavedForm'

export function useAcceptAdminInvitation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [token, setToken] = useState(() => readInvitationToken(location.search, location.hash))
  const [values, setValues] = useState<InvitationPasswordValues>({ password: '', confirmation: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState({ busy: false, error: '', accepted: false })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const fragment = new URLSearchParams(location.hash.replace(/^#/, ''))
    if (!query.has('token') && !fragment.has('token')) return
    controller.current?.abort()
    lock.current = false
    setToken(readInvitationToken(location.search, location.hash))
    setValues({ password: '', confirmation: '' })
    setFeedback({ busy: false, error: '', accepted: false })
    query.delete('token')
    fragment.delete('token')
    // O token fica somente em memória: sai da barra de endereço e do histórico atual.
    navigate(
      {
        pathname: location.pathname,
        search: query.size ? `?${query}` : '',
        hash: fragment.size ? `#${fragment}` : '',
      },
      { replace: true },
    )
  }, [location.search, location.hash, location.pathname, navigate])
  useEffect(() => () => controller.current?.abort(), [])
  const loader = useCallback(
    (signal: AbortSignal) => inspectAdminInvitation(token, signal),
    [token],
  )
  const resource = useAbortableResource(loader)
  const result = resource.state.phase === 'ready' ? resource.state.data : null
  const preview = result?.kind === 'ready' ? result.data : null
  useUnsavedForm(!feedback.accepted && Boolean(values.password || values.confirmation))
  const submit = async () => {
    if (lock.current || !token || (preview && preview.status !== 'PENDING')) return
    const error = validateInvitationPasswords(values)
    if (error) {
      setFeedback({ busy: false, error, accepted: false })
      return
    }
    lock.current = true
    const request = new AbortController()
    controller.current = request
    setFeedback({ busy: true, error: '', accepted: false })
    try {
      // A confirmação é apenas uma validação de interface, nunca parte do DTO.
      await acceptAdminInvitation({ token, password: values.password }, request.signal)
      if (!request.signal.aborted) {
        setValues({ password: '', confirmation: '' })
        setToken('')
        setFeedback({ busy: false, error: '', accepted: true })
      }
    } catch (error: unknown) {
      if (!request.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível aceitar o convite.',
          accepted: false,
        })
    } finally {
      if (controller.current === request) lock.current = false
    }
  }
  return {
    ...resource,
    tokenPresent: Boolean(token),
    preview,
    values,
    setValues,
    showPassword,
    setShowPassword,
    feedback,
    submit,
    available: Boolean(adminInvitationGateway.accept),
  }
}
