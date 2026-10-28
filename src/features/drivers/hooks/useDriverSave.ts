import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import type { DriverFormMode, DriverFormValues } from '../types/driver'
import { driverSaveAvailable, saveDriver } from '../api/driverService'

export function useDriverSave(mode: DriverFormMode, id: string | undefined) {
  const [feedback, setFeedback] = useState({ busy: false, error: '', success: '' })
  const [savedValues, setSavedValues] = useState<DriverFormValues | null>(null)
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useEffect(() => () => controller.current?.abort(), [])
  const navigate = useNavigate()
  const location = useLocation()
  const requestedReturn: unknown = location.state?.returnTo
  const returnTo =
    typeof requestedReturn === 'string' && /^\/motoristas(\?|$)/.test(requestedReturn)
      ? requestedReturn
      : '/motoristas'
  const available = driverSaveAvailable(mode)
  const save = async (values: DriverFormValues) => {
    if (lock.current || !available) return
    lock.current = true
    controller.current = new AbortController()
    setFeedback({ busy: true, error: '', success: '' })
    try {
      const driver = await saveDriver(mode, values, id, controller.current.signal)
      if (!controller.current.signal.aborted) {
        setSavedValues(values)
        setFeedback({
          busy: false,
          error: '',
          success: `Cadastro salvo: ${driver.name}.`,
        })
        navigate(returnTo, {
          replace: true,
          state: {
            notice: `Motorista ${driver.name} ${mode === 'create' ? 'cadastrado' : 'atualizado'}.`,
          },
        })
      }
    } catch (error: unknown) {
      if (!controller.current.signal.aborted)
        setFeedback({
          busy: false,
          error: error instanceof Error ? error.message : 'Não foi possível salvar.',
          success: '',
        })
    } finally {
      lock.current = false
    }
  }
  return { feedback, savedValues, available, save, returnTo }
}
