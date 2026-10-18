import React from 'react'
import type { HealthResponse } from '../types'

interface TopNavProps {
  health: HealthResponse | null
  searchQuery: string
  onSearchChange: (q: string) => void
  onAddDocument: () => void
  onModelPillClick: () => void
}

export const TopNav: React.FC<TopNavProps> = ({
  health,
  searchQuery,
  onSearchChange,
  onAddDocument,
  onModelPillClick,
}) => {
  const isHealthy = health?.model_available ?? true
  const modelLabel = health?.model_name || 'Gemma 3n'

  return (
    <div className="counsel-topbar">
      <div className="counsel-greeting">
        <h1>Welcome back, Arjun 👋</h1>
        <p>Review, analyze and understand your legal documents with confidence.</p>
      </div>

      <div className="counsel-actions-group">
        {/* Model Status Pill */}
        <div
          className="counsel-model-pill"
          onClick={onModelPillClick}
          title="Click to check runtime privacy status and connection details"
        >
          <span
            className="counsel-model-dot"
            style={{
              backgroundColor: isHealthy ? '#10B981' : '#EF4444',
            }}
          />
          <div className="counsel-model-text">
            <span
              className="counsel-model-title"
              style={{ color: isHealthy ? '#15803D' : '#DC2626' }}
            >
              {isHealthy ? 'Local model ready' : 'Local model offline'}
            </span>
            <span className="counsel-model-subtitle">
              {modelLabel} (On-device)
            </span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Search documents */}
        <div className="counsel-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="counsel-kbd">⌘ K</span>
        </div>

        {/* Add Document Button */}
        <button
          type="button"
          className="counsel-btn-add"
          onClick={onAddDocument}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add Document</span>
        </button>
      </div>
    </div>
  )
}
