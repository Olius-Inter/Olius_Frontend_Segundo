import { Pause, Play, Square, Volume2 } from 'lucide-react'
import { useSpeechReader } from '../../hooks/useSpeechReader'
import styles from './styles.module.css'

export default function SpeechControls() {
  const { supported, state, error, read, pause, stop } = useSpeechReader()
  return (
    <div className={styles.reader} data-reader-exclude>
      <div role="group" aria-label="Leitura em voz alta">
        <button type="button" disabled={!supported} onClick={read}>
          <Volume2 size={17} aria-hidden="true" />
          Ler página
        </button>
        <button type="button" disabled={!supported || state === 'idle'} onClick={pause}>
          {state === 'paused' ? (
            <Play size={17} aria-hidden="true" />
          ) : (
            <Pause size={17} aria-hidden="true" />
          )}
          {state === 'paused' ? 'Continuar' : 'Pausar'}
        </button>
        <button type="button" disabled={!supported || state === 'idle'} onClick={stop}>
          <Square size={15} aria-hidden="true" />
          Parar
        </button>
      </div>
      {!supported && <p>Leitura em voz alta não disponível neste navegador.</p>}
      {error && <p role="status">{error}</p>}
      <span className={styles.srOnly} role="status">
        {state === 'reading'
          ? 'Leitura em andamento'
          : state === 'paused'
            ? 'Leitura pausada'
            : 'Leitura parada'}
      </span>
    </div>
  )
}
