import sharedStyles from '../../styles/shared.module.css'
import styles from './styles.module.css'
import { mapClassNames } from '../../utils/classNames'
import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { CollectionChartProps } from '../../types/reports'
import { formatLiters, formatPercent } from '../../utils/reportFormatting'

const classStyles = { ...sharedStyles, ...styles }

export default function CollectionChart({ points, summary, period }: CollectionChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = points.find((point) => point.id === selectedId) ?? summary.latest
  const maximum = Math.max(1, ...points.map((point) => point.liters))
  const growth = summary.growthPercent
  const GrowthIcon = growth !== null && growth < 0 ? ArrowDown : ArrowUp
  return (
    <section
      className={['card', sharedStyles['report-chart-card']].join(' ')}
      aria-labelledby="collection-chart-title"
    >
      <h3 id="collection-chart-title">Óleo coletado no período</h3>
      <p className={sharedStyles['report-chart-subtitle']}>
        Litros · {period === 'monthly' ? 'por mês' : 'por ano'}
      </p>
      <p className={styles['report-main-value']}>
        {formatLiters(summary.latest?.liters ?? 0)} <span>L</span>
      </p>
      <div className={styles['report-growth-space']}>
        {growth !== null ? (
          <span
            className={mapClassNames(`report-growth${growth < 0 ? ' negative' : ''}`, classStyles)}
          >
            <GrowthIcon size={13} aria-hidden="true" />
            {formatPercent(Math.abs(growth))}% {growth < 0 ? 'abaixo' : 'acima'} do{' '}
            {period === 'monthly' ? 'mês' : 'ano'} anterior
          </span>
        ) : (
          <span className={styles['report-comparison-unavailable']}>
            Comparação anterior indisponível
          </span>
        )}
      </div>
      <p className="sr-only">
        Selecione uma barra para consultar o volume. A tabela abaixo apresenta todos os valores.
      </p>
      <div className={styles['report-bars-scroll']}>
        <div
          className={styles['report-bars']}
          style={{ gridTemplateColumns: `repeat(${points.length}, minmax(38px, 1fr))` }}
        >
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              className={styles['report-bar-button']}
              aria-label={`${point.label}: ${formatLiters(point.liters)} litros`}
              aria-pressed={selected?.id === point.id}
              onClick={() => setSelectedId(point.id)}
            >
              <span className={styles['report-bar-track']} aria-hidden="true">
                <span
                  className={styles['report-bar']}
                  style={{ height: `${(point.liters / maximum) * 100}%` }}
                >
                  <span className={styles['report-bar-tooltip']}>
                    {point.label}
                    <br />
                    {formatLiters(point.liters)} L
                  </span>
                </span>
              </span>
              <span className={styles['report-bar-label']} aria-hidden="true">
                {point.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className={styles['report-chart-selection']} role="status">
        {selected
          ? `${selected.label}: ${formatLiters(selected.liters)} L`
          : 'Nenhuma coleta no período.'}
      </p>
      <details className={sharedStyles['report-data-details']}>
        <summary>Ver dados das coletas</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Volume coletado em litros por período</caption>
            <thead>
              <tr>
                <th scope="col">Período</th>
                <th scope="col">Litros</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id}>
                  <th scope="row">{point.label}</th>
                  <td>{formatLiters(point.liters)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{formatLiters(summary.totalLiters)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </section>
  )
}
