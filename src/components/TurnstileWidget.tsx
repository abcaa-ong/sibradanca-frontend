import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
        },
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

type TurnstileWidgetProps = {
  siteKey: string
  onTokenChange: (token: string) => void
  onStatusChange?: (status: TurnstileWidgetStatus) => void
}

export type TurnstileWidgetStatus = 'idle' | 'loading' | 'ready' | 'error'

let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.turnstile) {
    return Promise.resolve()
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="true"]',
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = 'true'
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile script failed')), {
      once: true,
    })
    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

export function TurnstileWidget({ siteKey, onTokenChange, onStatusChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    let disposed = false

    onTokenChange('')
    onStatusChange?.('loading')

    if (!siteKey) {
      onStatusChange?.('error')
      return () => {
        onStatusChange?.('idle')
      }
    }

    void loadTurnstileScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.turnstile) {
          return
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            onTokenChange(token)
            onStatusChange?.('ready')
          },
          'expired-callback': () => {
            onTokenChange('')
            onStatusChange?.('ready')
          },
          'error-callback': () => {
            onTokenChange('')
            onStatusChange?.('error')
          },
        })
        onStatusChange?.('ready')
      })
      .catch(() => {
        onTokenChange('')
        onStatusChange?.('error')
      })

    return () => {
      disposed = true

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }

      widgetIdRef.current = null
      onStatusChange?.('idle')
    }
  }, [onStatusChange, onTokenChange, siteKey])

  return <div ref={containerRef} className="access-turnstile-widget" />
}
