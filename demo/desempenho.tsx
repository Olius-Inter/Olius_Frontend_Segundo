import { memo, Profiler, useCallback, useMemo, useState } from 'react'
import type { ProfilerOnRenderCallback } from 'react'
import { createRoot } from 'react-dom/client'
import type { Driver } from '../src/types/drivers/driver'
import type { DriverListFilters } from '../src/types/drivers/driverList'
import type { DriverComparisonProps, DriverPreviewProps } from '../src/types/demo/profiler'
import { selectDrivers } from '../src/utils/drivers/selectDrivers'
import './desempenho.css'

window.oliusProfilerSamples = []
const record: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  window.oliusProfilerSamples.push({ id, phase, actualDuration, baseDuration })
}
const drivers: Driver[] = Array.from({ length: 10000 }, (_, index) => ({
  id: String(index),
  name: `Motorista ${String((index * 7919) % 10000).padStart(5, '0')}`,
  cpf: '',
  cnh: '',
  status: 'ACTIVE',
}))
const Preview = memo(function Preview({ drivers: items, onSelect, id }: DriverPreviewProps) {
  return (
    <Profiler id={id} onRender={record}>
      <ul>
        {items.slice(0, 40).map((driver) => (
          <li key={driver.id}>
            <button type="button" onClick={() => onSelect(driver.id)}>
              {driver.name}
            </button>
          </li>
        ))}
      </ul>
    </Profiler>
  )
})
function Baseline({ drivers: items, filters, counter }: DriverComparisonProps) {
  const visible = selectDrivers(items, filters)
  const [selection, setSelection] = useState('')
  const onSelect = (id: string) => setSelection(id)
  return (
    <section>
      <h2>Sem memoização</h2>
      <p>Contador: {counter}</p>
      <p role="status">Selecionado: {selection || 'nenhum'}</p>
      <Preview id="lista-sem-memo" drivers={visible} onSelect={onSelect} />
    </section>
  )
}
function Optimized({ drivers: items, filters, counter }: DriverComparisonProps) {
  const visible = useMemo(() => selectDrivers(items, filters), [items, filters])
  const [selection, setSelection] = useState('')
  const onSelect = useCallback((id: string) => setSelection(id), [])
  return (
    <section>
      <h2>Com useMemo e useCallback</h2>
      <p>Contador: {counter}</p>
      <p role="status">Selecionado: {selection || 'nenhum'}</p>
      <Preview id="lista-com-memo" drivers={visible} onSelect={onSelect} />
    </section>
  )
}
function Demo() {
  const [counter, setCounter] = useState(0)
  const [filters, setFilters] = useState<DriverListFilters>({
    name: '',
    status: 'ALL',
    sort: 'name-asc',
  })
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(window.oliusProfilerSamples, null, 2)], {
        type: 'application/json',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'olius-profiler.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <main>
      <h1>Comparação no Profiler</h1>
      <p>
        10.000 motoristas sintéticos, com a regra de filtragem do projeto. Esta página é isolada e
        não consulta API.
      </p>
      <label htmlFor="search">Filtrar nomes</label>
      <input
        id="search"
        value={filters.name}
        onChange={(event) => setFilters((previous) => ({ ...previous, name: event.target.value }))}
      />
      <div className="actions">
        <button type="button" onClick={() => setCounter((value) => value + 1)}>
          Atualizar contador
        </button>
        <button
          type="button"
          onClick={() => {
            window.oliusProfilerSamples.length = 0
          }}
        >
          Limpar medições
        </button>
        <button type="button" onClick={download}>
          Baixar medições
        </button>
      </div>
      <p>
        Atualizar o contador não altera a lista. UseMemo preserva o resultado; useCallback preserva
        a função recebida pelo componente memo. Modificar o filtro deve atualizar os dois lados.
      </p>
      <div className="comparison">
        <Profiler id="sem-memo" onRender={record}>
          <Baseline drivers={drivers} filters={filters} counter={counter} />
        </Profiler>
        <Profiler id="com-memo" onRender={record}>
          <Optimized drivers={drivers} filters={filters} counter={counter} />
        </Profiler>
      </div>
      <p>
        Tempos dependem do computador. Este experimento não mede a latência de produção nem garante
        ganho nas outras telas.
      </p>
    </main>
  )
}
createRoot(document.getElementById('root')!).render(<Demo />)
