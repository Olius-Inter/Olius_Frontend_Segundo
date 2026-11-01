import { AdminFilters } from '../../modules/admin-records'
import { AdminChart } from '../../modules/dashboard'
import PageFeedback from '../../components/PageFeedback'
import { useAdminReports } from '../../hooks/reports/useAdminReports'
import { formatAdminValue } from '../../modules/admin-records'
import styles from '../../../styles/pages/AdminReportsPage/styles.module.css'

export default function AdminReportsPage() {
  const { filters, changeFilters, state, reload, result, data } = useAdminReports()
  return (
    <div className={styles.page}>
      <header>
        <h1>Relatórios</h1>
        <p>Acompanhe a evolução da operação no período.</p>
      </header>
      <AdminFilters hideSearch value={filters} statuses={[]} onChange={changeFilters} />
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
