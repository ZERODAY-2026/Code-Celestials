import React from 'react'
import type { DocumentExtraction, AnalysisResult } from '../types'

interface StatsBarProps {
  extraction: DocumentExtraction | null
  analysis: AnalysisResult | null
}

export const StatsBar: React.FC<StatsBarProps> = ({ extraction, analysis }) => {
  if (!extraction) return null

  const concernsCount =
    analysis?.findings.filter((f) => !!f.possible_concern).length || 0

  const highConfidenceCount =
    analysis?.findings.filter((f) => f.confidence === 'high').length || 0

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          SPEC // 01
        </span>
        <div className="stat-value">{extraction.file_type.toUpperCase()}</div>
        <div className="stat-label">Encoding</div>
      </div>

      <div className="stat-item">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          SPEC // 02
        </span>
        <div className="stat-value">{extraction.total_pages ? extraction.total_pages : '1'}</div>
        <div className="stat-label">{extraction.total_pages ? 'Pages' : 'Single Plain Text'}</div>
      </div>

      <div className="stat-item">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          SPEC // 03
        </span>
        <div className="stat-value">{extraction.total_chars.toLocaleString()}</div>
        <div className="stat-label">Characters</div>
      </div>

      <div className="stat-item">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          SPEC // 04
        </span>
        <div className="stat-value">{extraction.spans.length}</div>
        <div className="stat-label">Source Spans</div>
      </div>

      {analysis && (
        <>
          <div className="stat-item">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              SPEC // 05
            </span>
            <div className="stat-value">{analysis.findings.length}</div>
            <div className="stat-label">Clauses Evaluated</div>
          </div>

          <div className="stat-item">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              SPEC // 06
            </span>
            <div
              className="stat-value"
              style={{ color: concernsCount > 0 ? 'var(--accent-terracotta)' : 'var(--accent-emerald)' }}
            >
              {concernsCount}
            </div>
            <div className="stat-label">Potential Risks</div>
          </div>

          <div className="stat-item">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              SPEC // 07
            </span>
            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {highConfidenceCount}
            </div>
            <div className="stat-label">Grounded Cites</div>
          </div>
        </>
      )}
    </div>
  )
}
