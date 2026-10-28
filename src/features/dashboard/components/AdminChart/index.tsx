import type { AdminChartProps } from '../../../admin-records/contracts'
import { formatAdminValue } from '../../../admin-records'
import styles from './styles.module.css'

export default function AdminChart({ chart }: AdminChartProps) {
  const max = Math.max(1, ...chart.values.map((item) => item.value))
  return (
    <section className={styles.chart}>
      <h2>{chart.title}</h2>
      {chart.values.length ? (
        <>
          <div aria-hidden="true" className={styles.plot}>
            {chart.values.map((item) => (
              <div className={styles.bar} key={item.id}>
                <span style={{ height: `${(item.value / max) * 140}px` }} />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
          <details>
            <summary>Consultar valores do gráfico</summary>
            <table>
              <caption>{chart.title}</caption>
              <thead>
                <tr>
                  <th scope="col">Grupo</th>
                  <th scope="col">{chart.unit === 'L' ? 'Litros' : 'Quantidade'}</th>
                </tr>
              </thead>
              <tbody>
                {chart.values.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.label}</th>
                    <td>
                      {formatAdminValue(item.value, chart.unit === 'L' ? 'liters' : 'number')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : (
        <div className={styles.empty}>
          <span>—</span>
          <p>Dados oficiais do período aguardando integração.</p>
        </div>
      )}
    </section>
  )
}
