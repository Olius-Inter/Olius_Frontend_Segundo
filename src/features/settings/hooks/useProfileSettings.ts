import { usePortalProfile } from '../providers'
import { useEffect, useRef, useState } from 'react'
import type { PasswordInput, PortalProfile, ProfileInput } from '../types/settings'
import { changePortalPassword, savePortalProfile } from '../api/settingsService'
import { portalGateway } from '../api/settingsGateway'
import { validatePassword, validateProfile } from '../validation/settingsValidation'
import { useUnsavedForm } from '../../../shared/hooks/useUnsavedForm'

export function useProfileSettings(profile: PortalProfile, onSaved: (message: string) => void) {
  const [values, setValues] = useState<ProfileInput>({
    name: profile.name,
    email: profile.email,
    telephone: profile.telephone,
    avatar: null,
    removeAvatar: false,
  })
  const [password, setPassword] = useState<PasswordInput>({
    current: '',
    next: '',
    confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [preview, setPreview] = useState(profile.avatarUrl)
  const [feedback, setFeedback] = useState({ busy: false, error: '', success: '' })
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  const resource = usePortalProfile()
  const dirty =
    values.name !== profile.name ||
    values.email !== profile.email ||
    values.telephone !== profile.telephone ||
    Boolean(
      values.avatar ||
        values.removeAvatar ||
        password.current ||
        password.next ||
        password.confirmation,
    )
  useUnsavedForm(dirty && !feedback.success)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (values.removeAvatar) {
      setPreview(null)
      return
    }
    if (!values.avatar) {
      setPreview(profile.avatarUrl)
      return
    }
    const url = URL.createObjectURL(values.avatar)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [values.avatar, values.removeAvatar, profile.avatarUrl])
  const chooseAvatar = (file: File | undefined) => {
    if (!file) return
    const error = validateProfile({ ...values, avatar: file })
    if (error) {
      setFeedback({ busy: false, error, success: '' })
      return
    }
    setValues((previous) => ({ ...previous, avatar: file, removeAvatar: false }))
    setFeedback({ busy: false, error: '', success: '' })
  }
  const run = async (action: 'profile' | 'password') => {
    if (lock.current) return
    const error = action === 'profile' ? validateProfile(values) : validatePassword(password)
    if (error) {
      setFeedback({ busy: false, error, success: '' })
      return
    }
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '', success: '' })
    try {
      if (action === 'profile') {
        await savePortalProfile(values, controller.current.signal)
        if (!controller.current.signal.aborted) {
          onSaved('Perfil atualizado.')
          resource.reload()
        }
      } else {
        await changePortalPassword(password, controller.current.signal)
        if (!controller.current.signal.aborted)
          setPassword({ current: '', next: '', confirmation: '' })
      }
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error: '',
          success: 'Alteração concluída.',
        })
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível atualizar.',
          success: '',
        })
    } finally {
      lock.current = false
    }
  }
  return {
    values,
    setValues,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    preview,
    feedback,
    chooseAvatar,
    run,
    canSave: Boolean(portalGateway.profile?.save),
    canChangePassword: Boolean(portalGateway.profile?.password),
  }
}
