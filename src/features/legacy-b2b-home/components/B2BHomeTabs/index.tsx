import styles from './styles.module.css'
import { useRef } from 'react'
import { ChartNoAxesCombined, ClipboardList } from 'lucide-react'
import type { B2BHomeTabsProps } from '../../types/b2bHome'

export default function B2BHomeTabs({ active, showOffers, onChange }: B2BHomeTabsProps) {
  const ownRef = useRef<HTMLButtonElement>(null)
  const offersRef = useRef<HTMLButtonElement>(null)
  if (!showOffers) return null
  function move(key: string) {
    const next =
      key === 'Home' ? 'own' : key === 'End' ? 'offers' : active === 'own' ? 'offers' : 'own'
    onChange(next)
    ;(next === 'own' ? ownRef : offersRef).current?.focus()
  }
  return (
    <div
      className={styles['b2b-home-tabs']}
      role="tablist"
      aria-label="Visão do estabelecimento"
      onKeyDown={(event) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault()
          move(event.key)
        }
      }}
    >
      <button
        type="button"
        ref={ownRef}
        role="tab"
        id="b2b-own-tab"
        aria-selected={active === 'own'}
        aria-controls="b2b-own-panel"
        tabIndex={active === 'own' ? 0 : -1}
        onClick={() => onChange('own')}
      >
        <ChartNoAxesCombined size={17} aria-hidden="true" />
        Meus dados
      </button>
      <button
        type="button"
        ref={offersRef}
        role="tab"
        id="b2b-offers-tab"
        aria-selected={active === 'offers'}
        aria-controls="b2b-offers-panel"
        tabIndex={active === 'offers' ? 0 : -1}
        onClick={() => onChange('offers')}
      >
        <ClipboardList size={17} aria-hidden="true" />
        Coletas disponíveis
      </button>
    </div>
  )
}
