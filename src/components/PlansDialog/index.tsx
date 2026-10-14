import styles from './styles.module.css'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { subscriptionPlans } from '../../data/reportDemo'
import type { PlansDialogProps } from '../../types/reports'
import PlanCard from '../PlanCard'

export default function PlansDialog({
  open,
  period,
  selectedPlan,
  error,
  onChoose,
  onClose,
  triggerRef,
}: PlansDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    const trigger = triggerRef.current
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [open, triggerRef])

  return (
    <dialog
      ref={dialogRef}
      id="report-plans-dialog"
      className={styles['report-plans-dialog']}
      aria-labelledby="report-plans-title"
      aria-describedby="report-plans-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className={styles['report-plans-heading']}>
        <div>
          <h2 id="report-plans-title">Escolha seu plano</h2>
          <p id="report-plans-description">
            {period === 'yearly'
              ? 'Valores anuais demonstrativos.'
              : 'Valores mensais da referência.'}{' '}
            Seleção demonstrativa, sem cobrança.
          </p>
        </div>
        <button
          type="button"
          className={styles['report-dialog-close']}
          onClick={onClose}
          aria-label="Fechar planos"
          autoFocus
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p className={styles['report-selection-error']} role="alert">
          {error}
        </p>
      )}
      <div className={styles['report-plans-grid']}>
        {subscriptionPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={period}
            selected={plan.id === selectedPlan}
            onChoose={onChoose}
          />
        ))}
      </div>
      {period === 'yearly' && (
        <p className={styles['report-annual-note']}>
          Valor anual demonstrativo calculado por 12 mensalidades. Descontos e condições comerciais
          precisam ser confirmados.
        </p>
      )}
    </dialog>
  )
}
