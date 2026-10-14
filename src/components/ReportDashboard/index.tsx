import sharedStyles from '../../styles/shared.module.css'
import styles from './styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import { useReports } from '../../hooks/useReports'
import PageFeedback from '../PageFeedback'
import CollectionChart from '../CollectionChart'
import DestinationChart from '../DestinationChart'

const classStyles = { ...sharedStyles, ...styles }

export default function ReportDashboard() {
  const { resource, summary, preferences } = useReports()
  if (resource.state.phase === 'loading')
    return (
      <PageFeedback
        kind="loading"
        title="Carregando relatórios"
        description="Aguarde enquanto buscamos os resultados do período."
      />
    )
  if (resource.state.phase === 'error')
    return (
      <PageFeedback
        kind="error"
        title="Não foi possível carregar os relatórios"
        description={resource.state.message}
      >
        <button className="button" type="button" onClick={resource.reload}>
          Tentar novamente
        </button>
      </PageFeedback>
    )
  if (!summary || !resource.state.data.collection.length)
    return (
      <PageFeedback
        kind="empty"
        title="Nenhuma coleta neste período"
        description="Escolha outro ano ou período para consultar os resultados."
      />
    )
  return (
    <>
      <p
        className={mapClassNames(
          `report-source${resource.state.data.source === 'demo' ? ' demo' : ''}`,
          classStyles,
        )}
        role="status"
      >
        {resource.state.data.source === 'demo'
          ? 'Dados demonstrativos: estes valores são fictícios.'
          : 'Relatório carregado com sucesso.'}
      </p>
      <div className={styles['report-charts']}>
        <CollectionChart
          points={resource.state.data.collection}
          summary={summary}
          period={preferences.period}
        />
        <DestinationChart destinations={resource.state.data.destinations} />
      </div>
    </>
  )
}
