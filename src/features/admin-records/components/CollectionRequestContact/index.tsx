import type { CollectionRequestContactProps } from '../../types/admin'
import styles from './styles.module.css'

export default function CollectionRequestContact({ request }: CollectionRequestContactProps) {
  return (
    <section className={styles.contact}>
      <h3>Contato do estabelecimento</h3>
      <p>
        Combine a coleta diretamente com a empresa por telefone ou e-mail e informe abaixo a data e
        o horário programados.
      </p>
      <dl>
        <div>
          <dt>Telefone</dt>
          <dd>
            {request?.telephone ? (
              <a href={'tel:' + request.telephone.replace(/[^+\d]/g, '')}>{request.telephone}</a>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>
            {request?.email ? (
              <a href={'mailto:' + encodeURIComponent(request.email)}>{request.email}</a>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}
