import { Link } from 'react-router-dom'
import { AdminFilters } from '../../modules/admin-records'
import AdminChart from '../../components/AdminChart'
import PageFeedback from '../../components/PageFeedback'
import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard'
import { formatAdminValue } from '../../modules/admin-records'
import styles from '../../../styles/pages/AdminDashboardPage/styles.module.css'

export default function AdminDashboardPage() {
  const { filters, changeFilters, state, reload, data } = useAdminDashboard()
  return (
    <div className={styles.dashboard}>
      <header>
        <p>OPERAÇÃO OLIUS</p>
        <h1>Visão geral</h1>
        <p>O essencial para acompanhar sua operação.</p>
      </header>
      <AdminFilters hideSearch value={filters} statuses={[]} onChange={changeFilters} />
      {state.phase === 'loading' && <p role="status">Carregando indicadores…</p>}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Falha ao carregar indicadores"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {state.phase === 'ready' && state.data.kind === 'unavailable' && (
        <p className={styles.notice} role="status">
          Indicadores aguardando integração. Valores indisponíveis aparecem como —.
        </p>
      )}
      {data && (
        <>
          <section className={styles.metrics} aria-label="Indicadores operacionais">
            {data.metrics.map((metric) => (
              <Link key={metric.id} to={metric.href}>
                <span>{metric.label}</span>
                <strong>
                  {formatAdminValue(metric.value, metric.unit === 'L' ? 'liters' : 'number')}
                </strong>
                <small>Consultar registros →</small>
              </Link>
            ))}
          </section>
          <div className={styles.charts}>
            {data.charts.map((chart) => (
              <AdminChart key={chart.id} chart={chart} />
            ))}
          </div>
        </>
      )}
      <p className={styles.help}>
        Os indicadores e gráficos usam os valores vigentes do período completo selecionado. Volumes
        estimados não compõem os totais de recolhimento.
      </p>
    </div>
  )
}
