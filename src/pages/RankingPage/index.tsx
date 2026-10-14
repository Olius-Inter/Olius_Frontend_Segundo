import RankingHeader from '../../components/RankingHeader'
import RankingFilters from '../../components/RankingFilters'
import RankingPodium from '../../components/RankingPodium'
import RankingList from '../../components/RankingList'
import RankingAchievements from '../../components/RankingAchievements'
import RankingPagination from '../../components/RankingPagination'
import PageFeedback from '../../components/PageFeedback'
import { useRanking } from '../../hooks/useRanking'
import styles from './styles.module.css'

export default function RankingPage() {
  const { query, change, view, setView, data, state, reload } = useRanking()
  const kind = state.phase === 'ready' ? state.data.kind : null
  return (
    <div className={styles.ranking}>
      <RankingHeader data={data} />
      <RankingFilters query={query} view={view} onChange={change} onViewChange={setView} />
      <div className={styles.results} aria-busy={state.phase === 'loading'}>
        {state.phase === 'loading' && (
          <PageFeedback
            kind="loading"
            title="Carregando ranking"
            description="Consultando a classificação dos estabelecimentos."
          />
        )}
        {state.phase === 'error' && (
          <PageFeedback
            kind="error"
            title="Não foi possível carregar o ranking"
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
            title="Ranking aguardando conexão"
            description="A classificação, os volumes e as conquistas aparecerão quando a API estiver configurada."
          />
        )}
        {kind === 'unauthenticated' && (
          <PageFeedback
            kind="error"
            title="Sessão expirada"
            description="Entre novamente pelo fluxo de autenticação do Olius para consultar o ranking."
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
            description="Este ranking está disponível para estabelecimentos B2B autorizados."
          >
            <button type="button" onClick={reload}>
              Verificar acesso novamente
            </button>
          </PageFeedback>
        )}
        {data && (
          <>
            <div className={styles.period}>
              <h2>{data.periodLabel}</h2>
              <p>{data.criteria}</p>
            </div>
            {view === 'achievements' ? (
              <RankingAchievements achievements={data.achievements} />
            ) : data.items.length ? (
              <>
                <RankingPodium entries={data.podium} establishmentId={data.establishment.id} />
                <RankingList entries={data.items} establishmentId={data.establishment.id} />
                <RankingPagination
                  page={query.page}
                  totalPages={data.totalPages}
                  total={data.total}
                  onChange={(page) => change({ page })}
                />
              </>
            ) : (
              <PageFeedback
                kind="empty"
                title="Nenhum estabelecimento classificado neste período"
                description="A classificação será exibida quando houver coletas confirmadas elegíveis."
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
