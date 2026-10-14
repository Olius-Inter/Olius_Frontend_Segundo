import { Link } from 'react-router-dom'
import PageFeedback from '../../components/PageFeedback'

export default function NotFoundPage() {
  return (
    <PageFeedback
      kind="not-found"
      label="ERRO 404"
      title="Página não encontrada"
      description="O endereço pode ter sido alterado ou não existir. Volte ao início para continuar."
      headingLevel="h1"
    >
      <Link className="button" to="/">
        Voltar ao início
      </Link>
    </PageFeedback>
  )
}
