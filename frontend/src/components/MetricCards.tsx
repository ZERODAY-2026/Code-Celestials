import React from 'react'

interface MetricCardsProps {
  needsReviewCount?: number
  inReviewCount?: number
  reviewedCount?: number
  risksFoundCount?: number
  onFilterStatus?: (status: string | null) => void
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  needsReviewCount = 4,
  inReviewCount = 3,
  reviewedCount = 12,
  risksFoundCount = 18,
  onFilterStatus,
}) => {
  return (
    <div className="counsel-stats-grid">
      {/* 1. Needs Review */}
      <div
        className="counsel-stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterStatus && onFilterStatus('Needs Review')}
      >
        <div className="counsel-stat-top">
          <div className="counsel-stat-icon yellow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span className="counsel-stat-title">Needs Review</span>
        </div>
        <div className="counsel-stat-mid">
          <span className="counsel-stat-value">{needsReviewCount}</span>
          <span className="counsel-stat-unit">Documents</span>
        </div>
        <div className="counsel-stat-footer">Require your attention</div>
      </div>

      {/* 2. In Review */}
      <div
        className="counsel-stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterStatus && onFilterStatus('Processing')}
      >
        <div className="counsel-stat-top">
          <div className="counsel-stat-icon blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span className="counsel-stat-title">In Review</span>
        </div>
        <div className="counsel-stat-mid">
          <span className="counsel-stat-value">{inReviewCount}</span>
          <span className="counsel-stat-unit">Documents</span>
        </div>
        <div className="counsel-stat-footer">Currently being analyzed</div>
      </div>

      {/* 3. Reviewed */}
      <div
        className="counsel-stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterStatus && onFilterStatus('Reviewed')}
      >
        <div className="counsel-stat-top">
          <div className="counsel-stat-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <span className="counsel-stat-title">Reviewed</span>
        </div>
        <div className="counsel-stat-mid">
          <span className="counsel-stat-value">{reviewedCount}</span>
          <span className="counsel-stat-unit">Documents</span>
        </div>
        <div className="counsel-stat-footer">Completed this month</div>
      </div>

      {/* 4. Risks Found */}
      <div
        className="counsel-stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterStatus && onFilterStatus('Risk Found')}
      >
        <div className="counsel-stat-top">
          <div className="counsel-stat-icon red">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <span className="counsel-stat-title">Risks Found</span>
        </div>
        <div className="counsel-stat-mid">
          <span className="counsel-stat-value">{risksFoundCount}</span>
          <span className="counsel-stat-unit">Across all documents</span>
        </div>
        <div className="counsel-stat-footer">High & medium priority</div>
      </div>
    </div>
  )
}
