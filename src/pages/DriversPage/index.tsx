import { useEffect, useState } from 'react'
import { listDrivers } from '../../services/driverService'
import type { Driver } from '../../types/driver'

type PageState =
  | { phase: 'loading'; drivers: Driver[] }
  | { phase: 'ready'; drivers: Driver[] }
  | { phase: 'error'; message: string }

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
      .catch((error: unknown) => {
        if (!active) return
        setState({
          phase: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível carregar os motoristas.',
        })
      })

    return () => {
      active = false
    }
  }, [reload])

  return (
    <>
      <p className="eyebrow">CADASTROS</p>
      <h1>Motoristas</h1>
      <p className="lead">Lista de profissionais usados nas operações de coleta.</p>

      {state.phase === 'loading' && (
        <p className="notice" role="status">Carregando motoristas...</p>
      )}

      {state.phase === 'error' && (
        <section className="notice notice-error" role="alert">
          <p>{state.message}</p>
          <button className="button button-secondary" type="button" onClick={() => setReload((value) => value + 1)}>
            Tentar novamente
          </button>
        </section>
      )}

      {state.phase === 'ready' && state.drivers.length === 0 && (
        <p className="notice" role="status">Nenhum motorista cadastrado.</p>
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
                      <span className={`status-chip ${driver.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
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
