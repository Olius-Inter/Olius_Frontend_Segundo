import { Link } from 'react-router-dom'
import PageFeedback from '../../../../shared/ui/PageFeedback'

export default function CollectorEnrollmentPage() {
  return (
    <PageFeedback
      kind="empty"
      headingLevel="h1"
      title="Cadastro de ponto de coleta"
      description="O formulário deste cadastro será disponibilizado em uma próxima etapa. O envio deverá registrar a localização do ponto e passar pela validação do Olius. As funções de coleta serão habilitadas conforme a autorização retornada pela API."
    >
      <Link to="/mapa">Voltar aos pontos de coleta</Link>
    </PageFeedback>
  )
}
