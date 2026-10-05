import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p className="lead">Esse endereço não existe no Olius.</p>
      <Link className="button" to="/">Voltar ao início</Link>
    </>
  )
}
