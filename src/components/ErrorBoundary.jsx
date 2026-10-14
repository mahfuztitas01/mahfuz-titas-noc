import React from 'react'
import { BRAND } from '../config/branding.js'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  handleClear = () => {
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-xl font-semibold mb-1">{BRAND.name}</h1>
          <p className="text-slate-400 mb-4">Something went wrong while loading this page.</p>
          <pre className="text-left text-xs whitespace-pre-wrap break-words rounded-lg bg-slate-900 border border-slate-800 p-3 text-rose-300 mb-4">
            {String((this.state.error && this.state.error.message) || this.state.error)}
          </pre>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700"
            >
              Reload
            </button>
            <button
              onClick={this.handleClear}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
            >
              Clear local data &amp; reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}
