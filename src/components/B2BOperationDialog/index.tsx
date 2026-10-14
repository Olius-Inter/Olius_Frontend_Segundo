import styles from './styles.module.css'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { X } from 'lucide-react'
import type {
  B2BOperationDialogProps,
  B2BOperationValues,
  B2BOperationErrors,
} from '../../types/b2bHome'
import { B2BServiceError, submitB2BOperation } from '../../services/b2bHomeService'
import { validateB2BOperation } from '../../utils/b2bHomeRules'

export default function B2BOperationDialog({
  operation,
  data,
  onClose,
  onSuccess,
  onAuthorizationLost,
  triggerRef,
}: B2BOperationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const submittingRef = useRef(false)
  const lastSubmission = useRef<{ body: string; key: string } | null>(null)
  const [form, setForm] = useState<{
    values: B2BOperationValues
    errors: B2BOperationErrors
    phase: 'editing' | 'submitting'
    message: string | null
  }>({
    values: { liters: '', windowStart: '', windowEnd: '' },
    errors: {},
    phase: 'editing',
    message: null,
  })
  const busy = form.phase === 'submitting'
  const requesting = operation === 'request'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !operation || !data) return
    setForm({
      values: {
        liters:
          operation === 'request' && data.oilStock.availableLiters !== null
            ? String(data.oilStock.availableLiters)
            : '',
        windowStart: '',
        windowEnd: '',
      },
      errors: {},
      phase: 'editing',
      message: null,
    })
    lastSubmission.current = null
    const trigger = triggerRef.current
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      trigger?.focus()
      abortRef.current?.abort()
    }
  }, [operation, data, triggerRef])

  function change(field: keyof B2BOperationValues, value: string) {
    setForm((previous) => ({
      ...previous,
      values: { ...previous.values, [field]: value },
      errors: { ...previous.errors, [field]: undefined },
      message: null,
    }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data || !operation || submittingRef.current) return
    if (
      (operation === 'register' && !data.canRegisterOil) ||
      (operation === 'request' && !data.oilStock.canRequestCollection)
    )
      return
    const errors = validateB2BOperation(form.values, operation, data.oilStock)
    if (Object.keys(errors).length) {
      setForm((previous) => ({ ...previous, errors, message: null }))
      dialogRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`)?.focus()
      return
    }
    const input = {
      establishmentId: data.establishment.id,
      liters: Number(form.values.liters.replace(',', '.')),
      ...(operation === 'request'
        ? {
            windowStart: new Date(form.values.windowStart).toISOString(),
            windowEnd: new Date(form.values.windowEnd).toISOString(),
          }
        : {}),
    }
    const body = JSON.stringify({ operation, input })
    if (lastSubmission.current?.body !== body)
      lastSubmission.current = { body, key: crypto.randomUUID() }
    const controller = new AbortController()
    abortRef.current = controller
    submittingRef.current = true
    setForm((previous) => ({ ...previous, phase: 'submitting', message: null }))
    try {
      await submitB2BOperation(operation, input, controller.signal, lastSubmission.current.key)
      if (!controller.signal.aborted)
        onSuccess(
          operation === 'register'
            ? 'Óleo registrado com sucesso. O saldo será atualizado pelo Olius.'
            : 'Solicitação enviada com sucesso. Acompanhe a aprovação no painel.',
        )
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
        if (error instanceof B2BServiceError && [401, 403].includes(error.status))
          onAuthorizationLost({ kind: 'error', message })
        else setForm((previous) => ({ ...previous, phase: 'editing', message }))
      }
    } finally {
      submittingRef.current = false
    }
  }

  function fieldProps(field: keyof B2BOperationValues) {
    return {
      name: field,
      id: `b2b-${field}`,
      value: form.values[field],
      disabled: busy,
      required: true,
      'aria-invalid': Boolean(form.errors[field]),
      'aria-describedby': form.errors[field] ? `b2b-${field}-error` : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement>) => change(field, event.target.value),
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="b2b-operation-dialog"
      className={styles['b2b-operation-dialog']}
      aria-labelledby="b2b-operation-title"
      aria-describedby="b2b-operation-description"
      onCancel={(event) => {
        event.preventDefault()
        if (!submittingRef.current) onClose()
      }}
    >
      <div className={styles['b2b-dialog-heading']}>
        <h2 id="b2b-operation-title">{requesting ? 'Solicitar coleta' : 'Registrar óleo'}</h2>
        <button
          type="button"
          className={styles['b2b-close-button']}
          aria-label="Fechar formulário"
          disabled={busy}
          onClick={onClose}
        >
          <X size={21} aria-hidden="true" />
        </button>
      </div>
      <p id="b2b-operation-description">
        {requesting
          ? 'Informe o volume estimado e uma janela de atendimento. O aceite não confirma a retirada do óleo.'
          : 'Registre o óleo armazenado no seu estabelecimento. Este registro não representa uma coleta confirmada.'}
      </p>
      <form noValidate onSubmit={submit} aria-busy={busy}>
        <label htmlFor="b2b-liters">Volume em litros *</label>
        <input
          {...fieldProps('liters')}
          type="text"
          inputMode="decimal"
          maxLength={10}
          autoComplete="off"
          placeholder="Ex.: 10,50"
          autoFocus
        />
        {form.errors.liters && (
          <p className={styles['b2b-field-error']} id="b2b-liters-error" role="alert">
            {form.errors.liters}
          </p>
        )}
        {requesting && (
          <div className={styles['b2b-window-fields']}>
            {(['windowStart', 'windowEnd'] as const).map((field) => (
              <div key={field}>
                <label htmlFor={`b2b-${field}`}>
                  {field === 'windowStart' ? 'Início da janela *' : 'Fim da janela *'}
                </label>
                <input {...fieldProps(field)} type="datetime-local" />
                {form.errors[field] && (
                  <p className={styles['b2b-field-error']} id={`b2b-${field}-error`} role="alert">
                    {form.errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {form.message && (
          <p className={styles['b2b-field-error']} role="alert">
            {form.message}
          </p>
        )}
        <div className={styles['b2b-dialog-actions']}>
          <button
            type="button"
            className={styles['b2b-cancel-button']}
            disabled={busy}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="button" disabled={busy}>
            {busy ? 'Enviando…' : requesting ? 'Enviar solicitação' : 'Salvar registro'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
