import React from 'react'
import type { HealthResponse, PrivacyStatus } from '../types'
import { TrashIcon } from './Icons'

interface HeaderProps {
  health: HealthResponse | null
  privacy: PrivacyStatus | null
  activeSession: boolean
  onReset: () => void
}

export const Header: React.FC<HeaderProps> = ({
  health,
  privacy,
  activeSession,
  onReset,
}) => {
  const getBadgeClass = () => {
    if (!health) return 'degraded'
    if (health.status === 'healthy') return 'local'
    if (health.status === 'degraded') return 'degraded'
    return 'error'
  }

  const getBadgeText = () => {
    if (!health) return '// CONNECTING...'
    if (health.model_available) {
      return `● LOCAL ${health.model_name.toUpperCase()} // LOOPBACK ONLY`
    }
    return '▲ MODEL OFFLINE'
  }

  return (
    <header className="app-header">
      <div className="app-logo">
        <span className="app-logo-badge">INDEX // 02</span>
        <div>
          <h1>LEGAL TRIAGE ARCHITECTURE</h1>
          <div className="subtitle">
            DETERMINISTIC CLAUSE EXTRACTION & VERIFIABLE PASSAGE ANCHORING
          </div>
        </div>
      </div>

      <div className="header-actions">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            padding: '5px 8px',
            color: 'var(--text-secondary)',
          }}
        >
          v4.02 // STABLE
        </span>

        <div
          className={`privacy-badge ${getBadgeClass()}`}
          title={
            privacy?.message ||
            'Zero cloud leakage: all documents, embeddings, and inference remain 100% on your local machine.'
          }
        >
          <span className="privacy-dot" />
          <span>{getBadgeText()}</span>
        </div>

        {activeSession && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Clear current document and memory session"
          >
            <TrashIcon />
            <span>Reset Document</span>
          </button>
        )}
      </div>
    </header>
  )
}
