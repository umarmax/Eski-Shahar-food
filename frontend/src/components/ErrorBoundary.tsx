import { Component, type ReactNode } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { t } from '../lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const lang = useSettingsStore((s) => s.language)

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
      style={{ background: 'var(--tg-theme-bg-color)' }}
    >
      <div className="mb-4 text-6xl">😔</div>
      <h1
        className="mb-2 text-xl font-semibold"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        {t(lang, 'error_title')}
      </h1>
      <p
        className="mb-6 text-sm"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        {t(lang, 'error_subtitle')}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl px-6 py-3 text-sm font-semibold"
        style={{
          background: 'var(--tg-theme-button-color)',
          color: 'var(--tg-theme-button-text-color)',
        }}
      >
        {t(lang, 'error_reload')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />
    }

    return this.props.children
  }
}
