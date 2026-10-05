import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <>
      <h1>Gestão operacional</h1>
      <p>Acompanhe os cadastros que apoiam as coletas de óleo do Olius.</p>
      <Link to="/motoristas">Abrir motoristas</Link>
    </>
  )
}
