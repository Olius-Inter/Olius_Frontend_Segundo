import styles from './styles.module.css'
import sharedStyles from '../../../../shared/styles/shared.module.css'
import { useCallback, useRef } from 'react'
import ReportsProvider from '../../providers/ReportsContext'
import { useReports } from '../../hooks/useReports'
import { subscriptionPlans } from '../../data/reportDemo'
import { validatePlanId } from '../../validation/validateReports'
import type { PlanId } from '../../types/reports'
import ReportPeriodSelector from '../../components/ReportPeriodSelector'
import ReportDashboard from '../../components/ReportDashboard'
import PlansDialog from '../../components/PlansDialog'

function ReportsContent() {
  const { preferences, changePreferences, plans, dispatchPlans, storageAvailable } = useReports()
  const plansTriggerRef = useRef<HTMLButtonElement | null>(null)
  const closePlans = useCallback(() => dispatchPlans({ type: 'close' }), [dispatchPlans])
  const currentYear = new Date().getFullYear()

  function choosePlan(id: PlanId) {
    const plan = validatePlanId(id) ? subscriptionPlans.find((item) => item.id === id) : undefined
    if (!plan) {
      dispatchPlans({ type: 'invalid', message: 'Selecione um plano disponível.' })
      return
    }
    dispatchPlans({ type: 'choose', plan })
  }

  function openPlans() {
    plansTriggerRef.current =
      document.activeElement instanceof HTMLButtonElement ? document.activeElement : null
    dispatchPlans({ type: 'open' })
  }

  return (
    <div className={styles['reports-page']}>
      <div className={styles['reports-page-heading']}>
        <h1>Relatórios</h1>
        <p className="lead">Acompanhe os resultados e o impacto positivo das coletas.</p>
      </div>
      <ReportPeriodSelector onOpenPlans={openPlans} />
      {plans.phase === 'closed' && plans.feedback && (
        <p className={styles['report-plan-feedback']} role="status">
          {plans.feedback}
        </p>
      )}
      <div className={styles['reports-dashboard-heading']}>
        <div>
          <h2>Dashboards</h2>
          <p>Visualize os dados de forma interativa.</p>
        </div>
        <div className={styles['report-year-filter']}>
          <label htmlFor="report-year">Ano de referência</label>
          <select
            id="report-year"
            name="report-year"
            value={preferences.year}
            onChange={(event) => changePreferences({ year: Number(event.target.value) })}
          >
            {Array.from({ length: currentYear - 1999 }, (_, offset) => currentYear - offset).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
      {!storageAvailable && (
        <p className={sharedStyles['report-source']} role="status">
          As preferências serão mantidas somente enquanto esta página estiver aberta.
        </p>
      )}
      <ReportDashboard />
      <PlansDialog
        open={plans.phase !== 'closed'}
        period={preferences.period}
        selectedPlan={plans.selectedPlan}
        error={plans.phase === 'error' ? plans.feedback : null}
        onChoose={choosePlan}
        onClose={closePlans}
        triggerRef={plansTriggerRef}
      />
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ReportsProvider>
      <ReportsContent />
    </ReportsProvider>
  )
}
