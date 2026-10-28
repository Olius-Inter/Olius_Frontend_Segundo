import { useEffect } from 'react'

export function useUnsavedForm(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const navigate = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return
      const target = new URL(anchor.href)
      if (
        target.pathname === location.pathname &&
        target.search === location.search &&
        target.origin === location.origin
      )
        return
      if (
        !event.defaultPrevented &&
        !window.confirm('Existem dados não enviados. Deseja sair desta página?')
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', unload)
    document.addEventListener('click', navigate, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      document.removeEventListener('click', navigate, true)
    }
  }, [dirty])
}
