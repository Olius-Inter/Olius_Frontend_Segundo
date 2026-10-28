import styles from './styles.module.css'
import { useRef } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { DriverField } from '../../types/driver'
import type { DriverFormProps } from '../../types/driverForm'
import { useDriverForm } from '../../hooks/useDriverForm'
import { maskCpf, sanitizeDriver } from '../../validation/validateDriver'
import { useDriverSave } from '../../hooks/useDriverSave'
import { useUnsavedForm } from '../../../../shared/hooks/useUnsavedForm'
import FormField from '../FormField'
import FormFeedback from '../FormFeedback'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

function formatDate(value?: string): string {
  if (!value) return 'Não informada'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Não informada' : dateFormatter.format(date)
}

export default function DriverForm({ mode, initialValues, driver }: DriverFormProps) {
  const { state, change, blur, check } = useDriverForm(initialValues, mode)
  const formRef = useRef<HTMLFormElement>(null)
  const { feedback, savedValues, available, save, returnTo } = useDriverSave(mode, driver?.id)
  useUnsavedForm(
    JSON.stringify(sanitizeDriver(state.values)) !==
      JSON.stringify(sanitizeDriver(savedValues ?? initialValues)),
  )
  const editing = mode === 'edit'

  function fieldAttributes(field: DriverField) {
    const error = state.touched[field] ? state.errors[field] : undefined
    return {
      id: field,
      name: field,
      'aria-invalid': Boolean(error),
      'aria-describedby': `${field}-help${error ? ` ${field}-error` : ''}`,
      onBlur: () => blur(field),
    }
  }

  function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const firstError = check()
    if (firstError) formRef.current?.querySelector<HTMLElement>(`#${firstError}`)?.focus()
    else if ((event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'save')
      void save(state.values)
  }

  return (
    <form className={styles['driver-form']} ref={formRef} noValidate onSubmit={handleCheck}>
      <fieldset disabled={feedback.busy}>
        <legend>Dados do motorista</legend>
        <p className={styles['section-description']}>Campos com * são obrigatórios.</p>
        <FormField
          id="name"
          label="Nome"
          required
          help="Entre 3 e 120 caracteres."
          error={state.touched.name ? state.errors.name : undefined}
        >
          <input
            {...fieldAttributes('name')}
            value={state.values.name}
            onChange={(event) => change('name', event.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Nome do motorista"
          />
        </FormField>
        <div className={styles['field-grid']}>
          <FormField
            id="cpf"
            label="CPF"
            required={!editing}
            help={
              editing
                ? 'CPF somente para consulta; não pode ser alterado nesta edição.'
                : '11 dígitos. A pontuação é aplicada automaticamente.'
            }
            error={state.touched.cpf ? state.errors.cpf : undefined}
          >
            <input
              {...fieldAttributes('cpf')}
              value={editing ? maskCpf(state.values.cpf) : state.values.cpf}
              onChange={(event) => change('cpf', event.target.value)}
              readOnly={editing}
              required={!editing}
              inputMode={editing ? 'text' : 'numeric'}
              maxLength={14}
              autoComplete="off"
              placeholder="000.000.000-00"
            />
          </FormField>
          <FormField
            id="cnh"
            label="CNH"
            required
            help="Informe os 11 dígitos do número de registro."
            error={state.touched.cnh ? state.errors.cnh : undefined}
          >
            <input
              {...fieldAttributes('cnh')}
              value={state.values.cnh}
              onChange={(event) => change('cnh', event.target.value)}
              required
              inputMode="numeric"
              maxLength={11}
              autoComplete="off"
              placeholder="Número de registro"
            />
          </FormField>
        </div>
        <FormField
          id="status"
          label="Status"
          required={!editing}
          help={
            editing
              ? 'Inativação e reativação serão tratadas em um fluxo próprio.'
              : 'Situação inicial do cadastro.'
          }
          error={state.touched.status ? state.errors.status : undefined}
        >
          {editing ? (
            <input
              {...fieldAttributes('status')}
              value={state.values.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
              readOnly
            />
          ) : (
            <select
              {...fieldAttributes('status')}
              value={state.values.status}
              onChange={(event) => change('status', event.target.value)}
              required
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          )}
        </FormField>
      </fieldset>
      {editing && driver && (
        <section className={styles['record-meta']} aria-label="Datas do registro">
          <dl>
            <div>
              <dt>Data de cadastro</dt>
              <dd>{formatDate(driver.createdAt)}</dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{formatDate(driver.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      )}
      <FormFeedback checked={state.checked} valid={state.valid} />
      {feedback.error && <p role="alert">{feedback.error}</p>}
      {feedback.success && <p role="status">{feedback.success}</p>}
      <div className={styles['form-actions']}>
        <Link className={['button', styles['form-cancel']].join(' ')} to={returnTo}>
          Cancelar
        </Link>
        <button className="button" type="submit">
          Validar campos
        </button>
        <button
          className="button"
          type="submit"
          value="save"
          disabled={!available || feedback.busy}
        >
          {feedback.busy ? 'Salvando…' : 'Salvar cadastro'}
        </button>
      </div>
    </form>
  )
}
