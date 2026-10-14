import styles from './styles.module.css'
import sharedStyles from '../../styles/shared.module.css'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import type { B2BHomeFeedback, B2BHomeTab, B2BOperation } from '../../types/b2bHome'
import { useB2BHome } from '../../hooks/useB2BHome'
import { b2bEndpoints } from '../../services/b2bHomeService'
import B2BHomeHeader from '../../components/B2BHomeHeader'
import B2BHomeTabs from '../../components/B2BHomeTabs'
import B2BHomeNotice from '../../components/B2BHomeNotice'
import B2BImpactCards from '../../components/B2BImpactCards'
import B2BOilStock from '../../components/B2BOilStock'
import B2BOwnRequests from '../../components/B2BOwnRequests'
import B2BSustainability from '../../components/B2BSustainability'
import B2BOffers from '../../components/B2BOffers'
import B2BOperationDialog from '../../components/B2BOperationDialog'

export default function HomePage() {
  const { resource, data, reload, showOffers, registerEnabled, requestEnabled } = useB2BHome()
  const [tab, setTab] = useState<B2BHomeTab>('own')
  const [operation, setOperation] = useState<B2BOperation | null>(null)
  const [feedback, setFeedback] = useState<B2BHomeFeedback | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const activeTab = showOffers ? tab : 'own'
  const closeDialog = useCallback(() => setOperation(null), [])
  const changed = useCallback(
    (message: B2BHomeFeedback) => {
      setOperation(null)
      setTab('own')
      setFeedback(message)
      reload()
    },
    [reload],
  )
  const saved = useCallback((message: string) => changed({ message, kind: 'success' }), [changed])
  const denied =
    resource.state.phase === 'ready' &&
    ['unauthenticated', 'forbidden'].includes(resource.state.data.kind)
  const pendingIntegration =
    resource.state.phase === 'ready' && resource.state.data.kind === 'not-configured'

  function openOperation(next: B2BOperation) {
    if ((next === 'register' && !registerEnabled) || (next === 'request' && !requestEnabled)) return
    triggerRef.current =
      document.activeElement instanceof HTMLButtonElement ? document.activeElement : null
    setFeedback(null)
    setOperation(next)
  }

  return (
    <div className={styles['b2b-home']} aria-busy={resource.state.phase === 'loading'}>
      <B2BHomeHeader
        data={data}
        registerEnabled={registerEnabled}
        requestEnabled={requestEnabled}
        onOperation={openOperation}
      />
      {feedback && <B2BHomeNotice kind={feedback.kind}>{feedback.message}</B2BHomeNotice>}
      {resource.state.phase === 'loading' && (
        <B2BHomeNotice>Carregando os dados do estabelecimento…</B2BHomeNotice>
      )}
      {resource.state.phase === 'error' && (
        <B2BHomeNotice kind="error">{resource.state.message}</B2BHomeNotice>
      )}
      {pendingIntegration && (
        <B2BHomeNotice>
          Seus dados estarão disponíveis quando a conexão com o Olius estiver pronta. As ações serão
          habilitadas após a confirmação da sua conta B2B.
        </B2BHomeNotice>
      )}
      {denied && (
        <B2BHomeNotice kind="error">
          {resource.state.phase === 'ready' && resource.state.data.kind === 'unauthenticated'
            ? 'Entre com sua conta empresarial para acessar o início. Se sua sessão expirou, entre novamente.'
            : 'Este início está disponível apenas para contas B2B ativas e autorizadas.'}
        </B2BHomeNotice>
      )}
      {data && (!b2bEndpoints.register || !b2bEndpoints.request) && (
        <B2BHomeNotice>
          Algumas ações do estabelecimento ainda estão sendo disponibilizadas.
        </B2BHomeNotice>
      )}
      <B2BHomeTabs active={activeTab} showOffers={showOffers} onChange={setTab} />
      {!denied && (
        <>
          <div
            id="b2b-own-panel"
            role={showOffers ? 'tabpanel' : undefined}
            aria-labelledby={showOffers ? 'b2b-own-tab' : undefined}
            hidden={activeTab !== 'own'}
          >
            <B2BImpactCards impact={data?.impact ?? null} periodLabel={data?.periodLabel ?? null} />
            <div className={styles['b2b-details-grid']}>
              <B2BOilStock stock={data?.oilStock ?? null} />
              <B2BOwnRequests
                requests={data?.requests ?? []}
                total={data?.requestCount ?? 0}
                connected={data !== null}
              />
            </div>
            <div className={styles['b2b-bottom-grid']}>
              <B2BSustainability sustainability={data?.sustainability ?? null} />
              <section className={['card', styles['b2b-report-link']].join(' ')}>
                <span className={styles['b2b-report-icon']} aria-hidden="true">
                  <ArrowUpRight size={25} />
                </span>
                <h2>Um resumo do seu impacto</h2>
                <p>
                  Consulte os detalhes das coletas e da destinação no relatório do seu
                  estabelecimento.
                </p>
                <Link to="/relatorios">
                  Ver relatórios
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </section>
            </div>
          </div>
          {showOffers && data && (
            <div
              id="b2b-offers-panel"
              role="tabpanel"
              aria-labelledby="b2b-offers-tab"
              hidden={activeTab !== 'offers'}
            >
              {activeTab === 'offers' && <B2BOffers data={data} onChanged={changed} />}
            </div>
          )}
        </>
      )}
      {!pendingIntegration && (
        <div className={styles['b2b-home-footer']}>
          <p>Uma visão resumida do seu estabelecimento.</p>
          <button
            type="button"
            className={sharedStyles['b2b-text-button']}
            disabled={resource.state.phase === 'loading' || operation !== null}
            onClick={reload}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Atualizar painel
          </button>
        </div>
      )}
      <B2BOperationDialog
        operation={operation}
        data={data}
        onClose={closeDialog}
        onSuccess={saved}
        onAuthorizationLost={changed}
        triggerRef={triggerRef}
      />
    </div>
  )
}
