import { useCallback, useState } from 'react'
import { AdminFilters } from '../../../admin-records'
import { AdminChart } from '../../../dashboard'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import { defaultAdminFilters } from '../../../admin-records'
import { getAdminReports } from '../../api/adminReportService'
import { formatAdminValue } from '../../../admin-records'
import { useAbortableResource } from '../../../../shared/hooks/useAbortableResource'
import styles from './styles.module.css'

export default function AdminReportsPage() {
  const [filters, setFilters] = useState(defaultAdminFilters)
  const loader = useCallback(
    (signal: AbortSignal) => getAdminReports({ from: filters.from, to: filters.to }, signal),
    [filters],
  )
  const { state, reload } = useAbortableResource(loader)
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  return (
    <div className={styles.page}>
      <header>
        <h1>Relatórios</h1>
        <p>Acompanhe a evolução da operação no período.</p>
      </header>
      <AdminFilters
        hideSearch
        value={filters}
        statuses={[]}
        onChange={(patch) => setFilters((previous) => ({ ...previous, ...patch }))}
      />
      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando relatórios"
          description="Consultando os valores do período completo."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível consultar os relatórios"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {result?.kind === 'unavailable' && (
        <PageFeedback
          kind="empty"
          title="Relatórios aguardando integração"
          description={result.message}
        />
      )}
      {data && (
        <p className={styles.note}>Atualizado em {formatAdminValue(data.generatedAt, 'date')}</p>
      )}
      {data && !data.complete && (
        <p role="status">
          O relatório retornado está incompleto. Alguns valores podem estar ausentes.
        </p>
      )}
      {data && !data.charts.length && (
        <p role="status">Nenhum gráfico disponível para o período selecionado.</p>
      )}
      <div className={styles.charts}>
        {data?.charts.map((chart) => (
          <AdminChart key={chart.id} chart={chart} />
        ))}
      </div>
      <p className={styles.note}>
        Indicadores usam operações vigentes do período completo. Estimativas e operações anuladas
        não compõem os totais oficiais.
      </p>
    </div>
  )
}
