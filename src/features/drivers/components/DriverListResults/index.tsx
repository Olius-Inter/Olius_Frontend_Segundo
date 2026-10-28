import sharedStyles from '../../../../shared/styles/shared.module.css'
import styles from './styles.module.css'
import { Link } from 'react-router-dom'
import { useDrivers } from '../../hooks/useDrivers'
import DriverTable from '../DriverTable'
import PageFeedback from '../../../../shared/ui/PageFeedback'

export default function DriverListResults() {
  const { state, retry, total, resetFilters } = useDrivers()
  if (state.phase === 'loading')
    return (
      <PageFeedback
        kind="loading"
        title="Carregando motoristas"
        description="Aguarde enquanto buscamos os cadastros."
      />
    )
  if (state.phase === 'error')
    return (
      <PageFeedback
        kind="error"
        title="Não foi possível carregar os motoristas"
        description={state.message}
      >
        <button className="button button-secondary" type="button" onClick={retry}>
          Tentar novamente
        </button>
        <Link className={sharedStyles['page-feedback-link']} to="/">
          Voltar ao início
        </Link>
      </PageFeedback>
    )
  if (total === 0)
    return (
      <PageFeedback
        kind="empty"
        title="Nenhum motorista cadastrado"
        description="Os motoristas aparecerão aqui assim que houver cadastros disponíveis."
      />
    )
  if (state.drivers.length === 0)
    return (
      <PageFeedback
        kind="empty"
        title="Nenhum motorista encontrado"
        description="Altere ou limpe os filtros para visualizar outros cadastros."
      >
        <button className="button" type="button" onClick={resetFilters}>
          Limpar filtros
        </button>
      </PageFeedback>
    )
  return (
    <>
      <p className={styles['driver-result-count']} role="status">
        {state.drivers.length} de {total}{' '}
        {total === 1 ? 'motorista disponível' : 'motoristas disponíveis'}.
      </p>
      <DriverTable drivers={state.drivers} />
    </>
  )
}
