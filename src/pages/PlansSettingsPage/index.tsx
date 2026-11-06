import { formatAdminValue } from '../../utils/admin-records/adminFormatting'
import { useId, useRef, useState } from 'react'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import type { PortalPlan } from '../../types/settings/settings'
import { usePortalPlans } from '../../hooks/settings/usePortalPlans'
import PortalPlanCard from '../../components/PortalPlanCard'
import PageFeedback from '../../components/PageFeedback'
import styles from '../../../styles/pages/PlansSettingsPage/styles.module.css'

export default function PlansSettingsPage() {
  const { state, reload, data } = usePortalPlans()
  const [annual, setAnnual] = useState(false)
  const annualAvailable = Boolean(data?.some((plan) => plan.annualPrice !== null))
  const displayAnnual = annual && annualAvailable
  const [selected, setSelected] = useState<PortalPlan | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useDialogFocus(dialog, Boolean(selected))
  return (
    <section className={styles.plans}>
      <header>
        <span>PLANOS OLIUS</span>
        <h2>Um plano para cada etapa.</h2>
        <p>Compare limites e recursos de um jeito simples.</p>
      </header>
      <div role="group" aria-label="Periodicidade dos planos" className={styles.period}>
        <button type="button" aria-pressed={!displayAnnual} onClick={() => setAnnual(false)}>
          Mensal
        </button>
        <button
          type="button"
          aria-pressed={displayAnnual}
          disabled={!annualAvailable}
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
              <PortalPlanCard
                key={plan.id}
                plan={plan}
                annual={displayAnnual}
                onSelect={setSelected}
              />
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
        aria-labelledby={titleId}
        ref={dialog}
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <h2 id={titleId}>{selected.name}</h2>
            <p>{selected.description}</p>
            <dl>
              <div>
                <dt>Mensalidade</dt>
                <dd>{formatAdminValue(selected.monthlyPrice, 'money')}</dd>
              </div>
              {selected.annualPrice !== null && (
                <div>
                  <dt>Valor anual</dt>
                  <dd>{formatAdminValue(selected.annualPrice, 'money')}</dd>
                </div>
              )}
              <div>
                <dt>Franquia por ciclo</dt>
                <dd>{formatAdminValue(selected.liters, 'liters')}</dd>
              </div>
              <div>
                <dt>Coletas por ciclo</dt>
                <dd>{formatAdminValue(selected.collections, 'number')}</dd>
              </div>
            </dl>
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
