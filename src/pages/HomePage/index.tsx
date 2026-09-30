import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <>
      <p className="eyebrow">PAINEL ADMINISTRATIVO</p>
      <h1>Gestão operacional</h1>
      <p className="lead">Acompanhe os cadastros que apoiam as coletas de óleo do Olius.</p>
      <section className="card home-card">
        <div>
          <p className="eyebrow">PRIMEIRO MÓDULO</p>
          <h2>Motoristas</h2>
          <p>Consulte os motoristas cadastrados. Nas próximas etapas, entraremos no cadastro, edição e inativação.</p>
        </div>
        <Link className="button" to="/motoristas">Abrir motoristas</Link>
      </section>
    </>
  )
}
