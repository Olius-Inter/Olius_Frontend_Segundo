import { useState } from 'react'
import { usePreferences } from '../../hooks/usePreferences'
import SpeechControls from '../SpeechControls'
import styles from './styles.module.css'

export default function AccessibilityPanel() {
  const { preferences, change, reset, storageAvailable } = usePreferences()
  const [message, setMessage] = useState('')
  return (
    <section className={styles.panel}>
      <h2>Acessibilidade</h2>
      <p>Personalize a apresentação e a leitura do conteúdo.</p>
      <label>
        <span>
          <strong>Alto contraste</strong>
          <small>Reforça bordas, textos e controles.</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={preferences.contrast}
          onChange={(e) => change({ contrast: e.target.checked })}
        />
      </label>
      <label>
        <span>
          <strong>Leitura em voz alta</strong>
          <small>Mostrar controles de leitura em todas as páginas.</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={preferences.reader}
          onChange={(e) => change({ reader: e.target.checked })}
        />
      </label>
      {preferences.reader ? (
        <p>Os controles de leitura estão disponíveis acima do conteúdo da página.</p>
      ) : (
        <SpeechControls />
      )}
      <div className={styles.restore}>
        <h3>Restaurar preferências</h3>
        <p>Voltar ao tema claro, contraste padrão e controles de leitura ocultos.</p>
        <button
          type="button"
          onClick={() => {
            reset()
            setMessage('Preferências restauradas para o padrão.')
          }}
        >
          Restaurar preferências
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {!storageAvailable && (
        <p role="status">
          As preferências estão funcionando nesta sessão, mas o navegador não permitiu salvá-las.
        </p>
      )}
    </section>
  )
}
