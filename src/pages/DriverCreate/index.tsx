import sharedStyles from '../../styles/shared.module.css'
import PageHeading from '../../components/PageHeading'
import DriverForm from '../../components/DriverForm'

export default function DriverCreate() {
  return (
    <>
      <PageHeading
        title="Cadastrar motorista"
        description="Preencha os dados para preparar um novo cadastro."
      />
      <div className={['card', sharedStyles['form-card']].join(' ')}>
        <DriverForm
          mode="create"
          initialValues={{ name: '', cpf: '', cnh: '', status: 'ACTIVE' }}
        />
      </div>
    </>
  )
}
