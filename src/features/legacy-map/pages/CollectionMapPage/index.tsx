import { Link } from 'react-router-dom'
import CollectorInvitation from '../../components/CollectorInvitation'
import CollectionMapFilters from '../../components/CollectionMapFilters'
import CollectionMapView from '../../components/CollectionMapView'
import CollectionPointList from '../../components/CollectionPointList'
import CollectionMapPagination from '../../components/CollectionMapPagination'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import { useCollectionMap } from '../../hooks/useCollectionMap'
import { collectorEnabled } from '../../lib/collectionMapRules'
import type { CollectionPoint } from '../../types/collectionMap'
import styles from './styles.module.css'

const emptyPoints: CollectionPoint[] = []

export default function CollectionMapPage() {
  const {
    query,
    change,
    search,
    setSearch,
    location,
    locate,
    selectedId,
    select,
    data,
    state,
    reload,
    submitSearch,
  } = useCollectionMap()
  const kind = state.phase === 'ready' ? state.data.kind : null
  const enabled = collectorEnabled(data?.collector ?? null)
  return (
    <div className={styles.page}>
      <header>
        <h1>Pontos de Coleta</h1>
        <p>
          Consulte pontos de entrega voluntária e cadastre seu estabelecimento como ponto de coleta.
        </p>
      </header>
      {(data || kind === 'not-configured') && (
        <CollectorInvitation collector={data?.collector ?? null} />
      )}
      {enabled && (
        <aside className={styles.active} role="status">
          Seu ponto de coleta está ativo. A localização cadastrada aparece no mapa com o marcador
          azul de pessoa.
          <button
            type="button"
            onClick={() => data?.collector.ownPoint && select(data.collector.ownPoint.id)}
          >
            Ver meu ponto
          </button>
        </aside>
      )}
      <CollectionMapFilters
        query={query}
        search={search}
        locating={location.loading}
        onSearch={setSearch}
        onSubmit={submitSearch}
        onChange={change}
        onLocate={locate}
      />
      {location.message && <p role="status">{location.message}</p>}
      <CollectionMapView
        center={data?.center ?? null}
        points={data?.items ?? emptyPoints}
        ownPoint={data?.collector.ownPoint ?? null}
        selectedId={selectedId}
        onSelect={select}
      />
      {data && !enabled && data.collector.canApply && (
        <Link className={styles.apply} to="/mapa/virar-coletor">
          Vire Coletor
        </Link>
      )}
      <div aria-busy={state.phase === 'loading'}>
        {state.phase === 'loading' && (
          <PageFeedback
            kind="loading"
            title="Carregando pontos"
            description="Consultando os pontos autorizados na região."
          />
        )}
        {state.phase === 'error' && (
          <PageFeedback
            kind="error"
            title="Não foi possível carregar os pontos"
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
            title="Pontos aguardando conexão"
            description="A lista e as permissões estarão disponíveis quando a API estiver configurada."
          />
        )}
        {kind === 'unauthenticated' && (
          <PageFeedback
            kind="error"
            title="Sessão expirada"
            description="Entre novamente no Olius para consultar seus pontos e permissões."
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
            description="Sua conta não tem autorização para esta consulta."
          >
            <button type="button" onClick={reload}>
              Verificar acesso novamente
            </button>
          </PageFeedback>
        )}
        {data &&
          (data.coverage === 'OUTSIDE' ? (
            <PageFeedback
              kind="empty"
              title="Fora da área de cobertura"
              description="Esta localização não possui coleta homologada pela BioPower."
            />
          ) : data.coverage === 'UNKNOWN' ? (
            <PageFeedback
              kind="empty"
              title="Localização a confirmar"
              description="Busque um endereço ou utilize sua localização para consultar a cobertura."
            />
          ) : data.items.length ? (
            <>
              <CollectionPointList points={data.items} selectedId={selectedId} onSelect={select} />
              <CollectionMapPagination
                page={query.page}
                totalPages={data.totalPages}
                total={data.total}
                onChange={(page) => change({ page })}
              />
            </>
          ) : (
            <PageFeedback
              kind="empty"
              title="Nenhum ponto para estes filtros"
              description="Experimente outra distância, endereço ou tipo de ponto."
            />
          ))}
      </div>
    </div>
  )
}
