import React from 'react'
import type { Finding } from '../types'

interface InsightsRailProps {
  dynamicFindings?: Finding[]
  onQuickAction: (action: string) => void
  onViewAllInsights: () => void
}

export const InsightsRail: React.FC<InsightsRailProps> = ({
  dynamicFindings,
  onQuickAction,
  onViewAllInsights,
}) => {
  return (
    <div className="counsel-content-right">
      {/* AI Review Insights Card */}
      <div className="counsel-card">
        <div className="counsel-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#10B981', fontSize: '0.9rem' }}>✦</span>
            <h3 className="counsel-card-title">AI Review Insights</h3>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }} onClick={onViewAllInsights}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Insight Item 1 */}
        <div className="counsel-insight-card">
          <div className="counsel-insight-header">
            <div className="counsel-insight-title-group">
              <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}>▲</span>
              <span className="counsel-insight-title">Limitation of Liability</span>
            </div>
            <span className="counsel-badge-priority high">High</span>
          </div>
          <p className="counsel-insight-desc">
            Clause 8.3 caps liability at $10K — significantly below industry standard. Recommend renegotiation.
          </p>
          <div className="counsel-insight-meta">
            <span>Clause 8.3 • Page 26</span>
            <span>94%</span>
          </div>
          <div className="counsel-progress-bar">
            <div className="counsel-progress-fill amber" style={{ width: '94%' }} />
          </div>
        </div>

        {/* Insight Item 2 */}
        <div className="counsel-insight-card">
          <div className="counsel-insight-header">
            <div className="counsel-insight-title-group">
              <span style={{ color: '#EF4444', fontSize: '0.9rem' }}>🛡️</span>
              <span className="counsel-insight-title">Missing Clause</span>
            </div>
            <span className="counsel-badge-priority high">High</span>
          </div>
          <p className="counsel-insight-desc">
            No data protection clause found in this agreement. GDPR compliance may be at risk.
          </p>
          <div className="counsel-insight-meta">
            <span>—</span>
            <span>98%</span>
          </div>
          <div className="counsel-progress-bar">
            <div className="counsel-progress-fill red" style={{ width: '98%' }} />
          </div>
        </div>

        {/* Insight Item 3 */}
        <div className="counsel-insight-card">
          <div className="counsel-insight-header">
            <div className="counsel-insight-title-group">
              <span style={{ color: '#10B981', fontSize: '0.9rem' }}>✓</span>
              <span className="counsel-insight-title">IP Ownership Clear</span>
            </div>
            <span className="counsel-badge-priority low">Low</span>
          </div>
          <p className="counsel-insight-desc">
            Intellectual property rights clearly defined in Section 12. No ambiguity detected.
          </p>
          <div className="counsel-insight-meta">
            <span>Section 12 • Page 41</span>
            <span>89%</span>
          </div>
          <div className="counsel-progress-bar">
            <div className="counsel-progress-fill green" style={{ width: '89%' }} />
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span className="counsel-link-arrow" onClick={onViewAllInsights}>
            <span>View all insights</span>
            <span>→</span>
          </span>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="counsel-card">
        <h3 className="counsel-card-title" style={{ marginBottom: '14px' }}>
          Quick Actions
        </h3>

        <div
          className="counsel-quick-action"
          onClick={() => onQuickAction('start-review')}
        >
          <div className="counsel-quick-action-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Start Contract Review</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div
          className="counsel-quick-action"
          onClick={() => onQuickAction('extract-clauses')}
        >
          <div className="counsel-quick-action-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
              <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
            <span>Extract Clauses</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div
          className="counsel-quick-action"
          onClick={() => onQuickAction('generate-report')}
        >
          <div className="counsel-quick-action-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>Generate Report</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
