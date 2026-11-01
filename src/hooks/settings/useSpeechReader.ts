import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useSpeechReader() {
  const [state, setState] = useState<'idle' | 'reading' | 'paused'>('idle')
  const [error, setError] = useState('')
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const active = useRef(0)
  const { pathname } = useLocation()
  const stop = () => {
    active.current++
    if (supported) speechSynthesis.cancel()
    setState('idle')
  }
  useEffect(() => {
    if (supported) {
      active.current++
      speechSynthesis.cancel()
      setState('idle')
    }
    return () => {
      active.current++
      if (supported) speechSynthesis.cancel()
    }
  }, [pathname, supported])
  const read = () => {
    if (!supported) return
    stop()
    setError('')
    const root = document.querySelector('main')
    if (!root) return
    const copy = root.cloneNode(true) as HTMLElement
    copy
      .querySelectorAll(
        'input,textarea,script,style,[data-reader-exclude], [hidden], [aria-hidden="true"]',
      )
      .forEach((node) => node.remove())
    const text = (copy.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 20000)
    if (!text) {
      setError('Não há conteúdo disponível para leitura.')
      return
    }
    const version = ++active.current
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.onend = () => {
      if (version === active.current) setState('idle')
    }
    utterance.onerror = () => {
      if (version === active.current) {
        setState('idle')
        setError('A leitura não pôde ser concluída. Confira a voz disponível no navegador.')
      }
    }
    setState('reading')
    speechSynthesis.speak(utterance)
  }
  const pause = () => {
    if (!supported) return
    if (state === 'paused') {
      speechSynthesis.resume()
      setState('reading')
    } else {
      speechSynthesis.pause()
      setState('paused')
    }
  }
  return { state, error, supported, read, pause, stop }
}
