import sharedStyles from '../../styles/shared.module.css'
import styles from './styles.module.css'
import type { DestinationChartProps } from '../../types/reports'
import { destinationColors, formatLiters, formatPercent } from '../../utils/reportFormatting'

export default function DestinationChart({ destinations }: DestinationChartProps) {
  const total = destinations.reduce((sum, destination) => sum + destination.liters, 0)
  const circumference = 2 * Math.PI * 68
  let offset = 0
  return (
    <section
      className={['card', sharedStyles['report-chart-card']].join(' ')}
      aria-labelledby="destination-chart-title"
    >
      <h3 id="destination-chart-title">Destino do óleo coletado</h3>
      <p className={sharedStyles['report-chart-subtitle']}>
        Percentual por destino · período selecionado
      </p>
      {total > 0 ? (
        <div className={styles['report-destination-content']}>
          <svg
            className={styles['report-donut']}
            viewBox="0 0 200 200"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="100" cy="100" r="68" fill="none" stroke="#eee" strokeWidth="32" />
            {destinations.map((destination, index) => {
              const length = (destination.liters / total) * circumference
              const start = offset
              offset += length
              return (
                <circle
                  key={destination.id}
                  cx="100"
                  cy="100"
                  r="68"
                  fill="none"
                  stroke={destinationColors[index % destinationColors.length]}
                  strokeWidth="32"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 100 100)"
                />
              )
            })}
          </svg>
          <ul className={styles['report-destination-legend']}>
            {destinations.map((destination, index) => (
              <li key={destination.id}>
                <span
                  className={styles['destination-dot']}
                  style={{ background: destinationColors[index % destinationColors.length] }}
                  aria-hidden="true"
                />
                <div>
                  <span>{destination.label}</span>
                  <small>
                    {formatLiters(destination.liters)} L (
                    {formatPercent((destination.liters / total) * 100)}%)
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles['report-no-destinations']}>
          Nenhum destino informado para este período.
        </p>
      )}
      <details className={sharedStyles['report-data-details']}>
        <summary>Ver dados dos destinos</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Distribuição do óleo coletado</caption>
            <thead>
              <tr>
                <th scope="col">Destino</th>
                <th scope="col">Litros</th>
                <th scope="col">Percentual</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((destination) => (
                <tr key={destination.id}>
                  <th scope="row">{destination.label}</th>
                  <td>{formatLiters(destination.liters)}</td>
                  <td>{total ? formatPercent((destination.liters / total) * 100) : '0'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
