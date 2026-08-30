/**
 * CODEHALAAM — The Gamified Code Hosting Platform
 * 
 * © 2026 JustShipitAI. All rights reserved.
 * 
 * CONFIDENTIAL — TRADE SECRET
 * 
 * This file is proprietary and confidential. Unauthorized
 * copying, distribution, modification, or reverse engineering
 * of this file, via any medium, is strictly prohibited.
 * 
 * This code was developed with AI assistance under strict
 * confidentiality protocols. All intellectual property rights
 * are retained by the Owner.
 * 
 * For licensing inquiries: justshipitai@gmail.com
 */

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)' }}>
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" strokeWidth={1.5}
              style={{ color: 'var(--color-danger-fg)' }} />
            <h1 className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-fg-default)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6"
              style={{ color: 'var(--color-fg-muted)' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button onClick={() => { this.handleReset(); window.location.reload() }}
              className="btn btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              Refresh page
            </button>
            {this.state.error && (
              <pre className="mt-4 text-xs p-3 rounded overflow-auto text-left"
                style={{ backgroundColor: 'var(--color-canvas-subtle)', color: 'var(--color-fg-muted)', maxHeight: 150 }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
