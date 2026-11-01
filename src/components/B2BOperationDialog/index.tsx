import styles from '../../../styles/components/B2BOperationDialog/styles.module.css'
import { X } from 'lucide-react'
import type { B2BOperationDialogProps } from '../../types/legacy-b2b-home/b2bHome'
import { useB2BOperationDialog } from '../../hooks/legacy-b2b-home/useB2BOperationDialog'

export default function B2BOperationDialog(props: B2BOperationDialogProps) {
  const { onClose } = props
  const { dialogRef, submittingRef, form, busy, requesting, submit, fieldProps } =
    useB2BOperationDialog(props)

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
