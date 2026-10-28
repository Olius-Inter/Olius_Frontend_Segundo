import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { AuthContextValue, AuthProviderProps, AuthState, LoginInput } from '../../types/auth'
import {
  coreConfigured,
  CoreError,
  onSessionInvalid,
  localDemoEnabled,
} from '../../../../shared/api/coreClient'
import { loginAdmin, logoutAdmin, restoreAdmin } from '../../api/authService'
import { loginLocalDemo } from '../../api/localDemoService'

export const AuthContext = createContext<AuthContextValue | null>(null)
export default function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer((_previous: AuthState, next: AuthState) => next, {
    phase: 'loading',
  })
  const restoration = useRef<Promise<void> | null>(null)
  const generation = useRef(0)
  const retry = useCallback(() => {
    if (localDemoEnabled) {
      dispatch({ phase: 'anonymous' })
      return
    }
    if (!coreConfigured) {
      dispatch({ phase: 'not-configured' })
      return
    }
    if (restoration.current) return
    const version = generation.current
    dispatch({ phase: 'loading' })
    restoration.current = restoreAdmin()
      .then((user) => {
        if (generation.current === version) dispatch({ phase: 'ready', user })
      })
      .catch((error: unknown) => {
        if (generation.current !== version) return
        if (error instanceof CoreError && error.status === 401) dispatch({ phase: 'anonymous' })
        else if (error instanceof CoreError && error.status === 403)
          dispatch({ phase: 'forbidden' })
        else
          dispatch({
            phase: 'error',
            message:
              error instanceof Error ? error.message : 'Não foi possível verificar sua sessão.',
          })
      })
      .finally(() => {
        restoration.current = null
      })
  }, [])
  useEffect(() => {
    retry()
    return onSessionInvalid(() => {
      generation.current++
      dispatch({ phase: 'anonymous' })
    })
  }, [retry])
  const login = useCallback(async (input: LoginInput) => {
    const version = ++generation.current
    const user = await (localDemoEnabled ? loginLocalDemo(input) : loginAdmin(input))
    if (version === generation.current) dispatch({ phase: 'ready', user })
  }, [])
  const logout = useCallback(async () => {
    generation.current++
    try {
      if (!localDemoEnabled) await logoutAdmin()
    } finally {
      dispatch({ phase: 'anonymous' })
    }
  }, [])
  const value = useMemo(
    () => ({ state, login, logout, retry, demo: localDemoEnabled }),
    [state, login, logout, retry],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
