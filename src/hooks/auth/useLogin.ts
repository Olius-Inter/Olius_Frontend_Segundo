import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { LoginInput } from '../../types/auth/auth'
import type {
  LoginErrors,
  LoginFeedback,
  LoginField,
  LoginFormResult,
} from '../../types/auth/login'
import {
  loginReturnPath,
  sanitizeLoginInput,
  validateLogin,
} from '../../utils/auth/loginValidation'
import { useAuth } from './useAuth'

export function useLogin(): LoginFormResult {
  const { state, login, retry } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [feedback, setFeedback] = useState<LoginFeedback>({ busy: false, message: '' })
  const lock = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const navigationState: unknown = location.state
  const from =
    navigationState && typeof navigationState === 'object' && 'from' in navigationState
      ? navigationState.from
      : undefined
  const notice =
    navigationState &&
    typeof navigationState === 'object' &&
    'notice' in navigationState &&
    typeof navigationState.notice === 'string'
      ? navigationState.notice
      : null
  const change = (field: LoginField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setFeedback((previous) => ({ ...previous, message: '' }))
  }
  const blur = (field: LoginField) => {
    const nextErrors = validateLogin(sanitizeLoginInput(values))
    setErrors((previous) => ({ ...previous, [field]: nextErrors[field] }))
  }
  const submit = async (): Promise<LoginField | null> => {
    if (lock.current) return null
    const clean = sanitizeLoginInput(values)
    const nextErrors = validateLogin(clean)
    setErrors(nextErrors)
    const firstError: LoginField | null = nextErrors.email
      ? 'email'
      : nextErrors.password
        ? 'password'
        : null
    if (firstError) {
      setFeedback({ busy: false, message: '' })
      return firstError
    }
    lock.current = true
    setFeedback({ busy: true, message: '' })
    try {
      await login(clean)
      if (mounted.current) setValues((previous) => ({ ...previous, password: '' }))
    } catch (error: unknown) {
      if (mounted.current)
        setFeedback({
          busy: false,
          message: error instanceof Error ? error.message : 'Não foi possível entrar.',
        })
    } finally {
      lock.current = false
      if (mounted.current) setFeedback((previous) => ({ ...previous, busy: false }))
    }
    return null
  }
  return {
    state,
    retry,
    values,
    errors,
    feedback,
    target: loginReturnPath(from),
    notice,
    change,
    blur,
    submit,
  }
}
