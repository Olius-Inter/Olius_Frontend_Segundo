import { useEffect, useRef, useState } from 'react'
import type { PortalPlan } from '../../types/settings'
import { getPortalPlans } from '../../api/settingsService'
import { useAbortableResource } from '../../../../shared/hooks/useAbortableResource'
import PortalPlanCard from '../../components/PortalPlanCard'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import styles from './styles.module.css'

export default function PlansSettingsPage() {
  const { state, reload } = useAbortableResource(getPortalPlans)
  const [annual, setAnnual] = useState(false)
  const [selected, setSelected] = useState<PortalPlan | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (selected) dialog.current?.showModal()
    else dialog.current?.close()
  }, [selected])
  const data = state.phase === 'ready' && state.data.kind === 'ready' ? state.data.data : null
  return (
    <section className={styles.plans}>
      <header>
        <span>PLANOS OLIUS</span>
        <h2>Um plano para cada etapa.</h2>
        <p>Compare limites e recursos de um jeito simples.</p>
      </header>
      <div role="group" aria-label="Periodicidade dos planos" className={styles.period}>
        <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>
          Mensal
        </button>
        <button
          type="button"
          aria-pressed={annual}
          disabled={Boolean(data && !data.some((p) => p.annualPrice !== null))}
          onClick={() => setAnnual(true)}
        >
          Anual
        </button>
      </div>
      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando planos"
          description="Consultando o catálogo disponível."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível consultar os planos"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {state.phase === 'ready' && state.data.kind === 'unavailable' && (
        <PageFeedback
          kind="empty"
          title="Catálogo aguardando integração"
          description={state.data.message}
        />
      )}
      {data &&
        (data.length ? (
          <div className={styles.cards}>
            {data.map((plan) => (
              <PortalPlanCard key={plan.id} plan={plan} annual={annual} onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <p>Nenhum plano ativo retornado.</p>
        ))}
      <p className={styles.help}>
        Esta área apresenta o catálogo. Assinaturas, pagamentos e benefícios não são alterados por
        esta tela.
      </p>
      <dialog
        className={styles.dialog}
        aria-labelledby="plan-details-title"
        ref={dialog}
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <h2 id="plan-details-title">{selected.name}</h2>
            <p>{selected.description}</p>
            <ul>
              {selected.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p>Consulte o fluxo comercial autorizado para contratar ou alterar um plano.</p>
            <button type="button" onClick={() => setSelected(null)}>
              Fechar detalhes
            </button>
          </>
        )}
      </dialog>
    </section>
  )
}
