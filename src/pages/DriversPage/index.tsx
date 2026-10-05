import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageFeedback from '../../components/PageFeedback'
import { listDrivers } from '../../services/driverService'
import type { Driver } from '../../types/driver'

type PageState =
  | { phase: 'loading'; drivers: Driver[] }
  | { phase: 'ready'; drivers: Driver[] }
  | { phase: 'error' }

function maskCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, '')
  return digits.length === 11 ? `***.***.***-${digits.slice(-2)}` : 'CPF indisponível'
}

function maskCnh(cnh: string) {
  const digits = cnh.replace(/\D/g, '')
  return digits.length >= 4 ? `•••••••${digits.slice(-4)}` : 'CNH indisponível'
}

export default function DriversPage() {
  const [state, setState] = useState<PageState>({ phase: 'loading', drivers: [] })
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true

    listDrivers()
      .then((drivers) => {
        if (active) setState({ phase: 'ready', drivers })
      })
      .catch(() => {
        if (!active) return
        setState({ phase: 'error' })
      })

    return () => {
      active = false
    }
  }, [reload])

  function retry() {
    setState({ phase: 'loading', drivers: [] })
    setReload((value) => value + 1)
  }

  return (
    <>
      <p className="eyebrow">CADASTROS</p>
      <h1>Motoristas</h1>
      <p className="lead">Lista de profissionais usados nas operações de coleta.</p>

      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando motoristas"
          description="Aguarde enquanto buscamos os cadastros."
        />
      )}

      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível carregar os motoristas"
          description="Verifique sua conexão e tente novamente. Se o problema continuar, tente mais tarde."
        >
          <button
            className="button button-secondary"
            type="button"
            onClick={retry}
          >
            Tentar novamente
          </button>
          <Link className="page-feedback-link" to="/">Voltar ao início</Link>
        </PageFeedback>
      )}

      {state.phase === 'ready' && state.drivers.length === 0 && (
        <PageFeedback
          kind="empty"
          title="Nenhum motorista cadastrado"
          description="Os motoristas aparecerão aqui assim que houver cadastros disponíveis."
        />
      )}

      {state.phase === 'ready' && state.drivers.length > 0 && (
        <section className="card table-card" aria-label="Lista de motoristas">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">CPF</th>
                  <th scope="col">CNH</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.name}</td>
                    <td>{maskCpf(driver.cpf)}</td>
                    <td>{maskCnh(driver.cnh)}</td>
                    <td>
                      <span
                        className={`status-chip ${
                          driver.status === 'ACTIVE' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {driver.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
