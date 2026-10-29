import sharedStyles from '../../../../shared/styles/shared.module.css'
import { Link, useParams } from 'react-router-dom'
import DriverForm from '../../components/DriverForm'
import PageHeading from '../../../../shared/ui/PageHeading'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import { useDriverForEdit } from '../../hooks/useDriverForEdit'

export default function DriverEdit() {
  const { driverId } = useParams<{ driverId: string }>()
  const { state, retry } = useDriverForEdit(driverId)

  if (!driverId)
    return (
      <PageFeedback
        kind="error"
        title="Motorista não informado"
        description="Selecione um motorista na listagem."
      >
        <Link className="button" to="/motoristas">
          Voltar para motoristas
        </Link>
      </PageFeedback>
    )

  return (
    <>
      <PageHeading
        title="Editar motorista"
        description="Revise o nome e a CNH do motorista selecionado."
      />
      {state.phase === 'unavailable' && (
        <PageFeedback
          kind="empty"
          title="Integração pendente"
          description="A consulta individual de motoristas aguarda contrato administrativo da API."
        />
      )}
      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando motorista"
          description="Aguarde enquanto buscamos os dados do cadastro."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível carregar o motorista"
          description={state.message}
        >
          <button className="button" type="button" onClick={retry}>
            Tentar novamente
          </button>
          <Link className={sharedStyles['page-feedback-link']} to="/motoristas">
            Voltar para motoristas
          </Link>
        </PageFeedback>
      )}
      {state.phase === 'not-found' && (
        <PageFeedback
          kind="not-found"
          title="Motorista não encontrado"
          description="O cadastro solicitado não está disponível."
        >
          <Link className="button" to="/motoristas">
            Voltar para motoristas
          </Link>
        </PageFeedback>
      )}
      {state.phase === 'ready' && (
        <div className={['card', sharedStyles['form-card']].join(' ')}>
          <DriverForm
            key={state.driver.id}
            mode="edit"
            initialValues={state.driver}
            driver={state.driver}
          />
        </div>
      )}
    </>
  )
}
