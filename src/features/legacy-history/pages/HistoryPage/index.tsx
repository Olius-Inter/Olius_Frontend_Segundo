import { B2BImpactCards } from '../../../legacy-b2b-home'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import HistoryFilters from '../../components/HistoryFilters'
import HistoryTable from '../../components/HistoryTable'
import HistoryPagination from '../../components/HistoryPagination'
import { useHistory } from '../../hooks/useHistory'
import { historyPeriod } from '../../lib/historyRules'
import styles from './styles.module.css'

export default function HistoryPage() {
  const { query, change, data, state, reload } = useHistory()
  const kind = state.phase === 'ready' ? state.data.kind : null
  return (
    <div className={styles.history}>
      <header>
        <h1>Histórico de Coletas</h1>
        <p>
          {data
            ? `Todos os registros de óleo de ${data.establishment.name}.`
            : 'Todos os registros de óleo do seu estabelecimento.'}
        </p>
      </header>
      {data?.allowedScopes.includes('collections') && (
        <div className={styles.scopes} role="group" aria-label="Visão do histórico">
          <button
            type="button"
            aria-pressed={query.scope === 'own'}
            onClick={() => change({ scope: 'own' })}
          >
            Meu estabelecimento
          </button>
          <button
            type="button"
            aria-pressed={query.scope === 'collections'}
            onClick={() => change({ scope: 'collections' })}
          >
            Coletas realizadas
          </button>
        </div>
      )}
      <B2BImpactCards impact={data?.impact ?? null} periodLabel={historyPeriod(query)} />
      <p className={styles.note}>
        Indicadores do período completo, informados pelo servidor. Volumes estimados e confirmados
        são identificados na tabela.
      </p>
      <HistoryFilters query={query} onChange={change} />
      <div aria-busy={state.phase === 'loading'}>
        {state.phase === 'loading' && (
          <PageFeedback
            kind="loading"
            title="Carregando histórico"
            description="Consultando os registros do período selecionado."
          />
        )}
        {state.phase === 'error' && (
          <PageFeedback
            kind="error"
            title="Não foi possível carregar o histórico"
            description={state.message}
          >
            <button type="button" onClick={reload}>
              Tentar novamente
            </button>
            {query.page > 1 && (
              <button type="button" onClick={() => change({ page: 1 })}>
                Voltar à primeira página
              </button>
            )}
          </PageFeedback>
        )}
        {kind === 'not-configured' && (
          <PageFeedback
            kind="empty"
            title="Histórico aguardando conexão"
            description="Os registros e indicadores estarão disponíveis quando a API do histórico estiver configurada."
          />
        )}
        {kind === 'unauthenticated' && (
          <PageFeedback
            kind="error"
            title="Sessão expirada"
            description="Entre novamente pelo fluxo de autenticação do Olius para consultar seu histórico."
          >
            <button type="button" onClick={reload}>
              Verificar sessão novamente
            </button>
          </PageFeedback>
        )}
        {kind === 'forbidden' && (
          <PageFeedback
            kind="error"
            title="Acesso negado"
            description="Sua sessão não tem permissão para consultar este histórico."
          >
            <button
              type="button"
              onClick={() => (query.scope === 'collections' ? change({ scope: 'own' }) : reload())}
            >
              {query.scope === 'collections'
                ? 'Voltar ao meu estabelecimento'
                : 'Verificar acesso novamente'}
            </button>
          </PageFeedback>
        )}
        {data &&
          (data.items.length ? (
            <>
              <HistoryTable records={data.items} />
              <HistoryPagination
                page={query.page}
                totalPages={data.totalPages}
                total={data.total}
                onChange={(page) => change({ page })}
              />
            </>
          ) : (
            <PageFeedback
              kind="empty"
              title={
                data.periodTotal === 0
                  ? 'Nenhum registro neste período'
                  : 'Nenhum resultado para este filtro'
              }
              description={
                data.periodTotal === 0
                  ? 'Os registros aparecerão após serem disponibilizados pelo Olius.'
                  : 'Selecione outro status para consultar os registros do período.'
              }
            />
          ))}
      </div>
    </div>
  )
}
