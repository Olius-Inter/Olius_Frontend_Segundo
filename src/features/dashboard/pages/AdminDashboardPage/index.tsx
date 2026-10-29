import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminFilters } from '../../../admin-records'
import AdminChart from '../../components/AdminChart'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import { getAdminDashboard } from '../../api/dashboardService'
import { useAbortableResource } from '../../../../shared/hooks/useAbortableResource'
import { defaultAdminFilters } from '../../../admin-records'
import { formatAdminValue } from '../../../admin-records'
import type { AdminDashboardData } from '../../../admin-records/contracts'
import styles from './styles.module.css'

const metrics = [
  { id: 'pending', label: 'Solicitações pendentes', href: '/operacao/solicitacoes?status=PENDING' },
  { id: 'today', label: 'Visitas agendadas hoje', href: '/operacao/agenda' },
  { id: 'remaining', label: 'Visitas restantes no mês', href: '/operacao/agenda' },
]
const emptyCharts: AdminDashboardData['charts'] = [
  { id: 'liters', title: 'Evolução dos litros efetivamente recolhidos', unit: 'L', values: [] },
  { id: 'collections', title: 'Coletas ao longo do tempo', unit: 'count', values: [] },
]
export default function AdminDashboardPage() {
  const [filters, setFilters] = useState(defaultAdminFilters)
  const loader = useCallback((signal: AbortSignal) => getAdminDashboard(filters, signal), [filters])
  const { state, reload } = useAbortableResource(loader)
  const data = state.phase === 'ready' && state.data.kind === 'ready' ? state.data.data : null
  return (
    <div className={styles.dashboard}>
      <header>
        <p>OPERAÇÃO OLIUS</p>
        <h1>Visão geral</h1>
        <p>O essencial para acompanhar sua operação.</p>
      </header>
      <AdminFilters
        hideSearch
        value={filters}
        statuses={[]}
        onChange={(patch) => setFilters((previous) => ({ ...previous, ...patch }))}
      />
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
      <section className={styles.metrics} aria-label="Indicadores operacionais">
        {metrics.map((metric) => (
          <Link key={metric.id} to={metric.href}>
            <span>{metric.label}</span>
            <strong>
              {formatAdminValue(
                data?.metrics.find((item) => item.id === metric.id)?.value,
                'number',
              )}
            </strong>
            <small>Consultar registros →</small>
          </Link>
        ))}
      </section>
      <div className={styles.charts}>
        {(data?.charts ?? emptyCharts)
          .filter((chart) => ['liters', 'collections'].includes(chart.id))
          .map((chart) => (
            <AdminChart key={chart.id} chart={chart} />
          ))}
      </div>
      <p className={styles.help}>
        Os indicadores mostram a situação atual. Os gráficos usam os valores vigentes do período
        completo selecionado. Volumes estimados não compõem os totais de recolhimento.
      </p>
    </div>
  )
}
