import React from 'react'
import type { Finding, SourceSpan } from '../types'
import { AlertTriangleIcon, HelpCircleIcon } from './Icons'

interface FindingCardProps {
  finding: Finding
  index: number
  isSelected: boolean
  onSelect: () => void
  verifiedSpans: Record<string, SourceSpan>
  onSpanClick?: (spanId: string) => void
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  index,
  isSelected,
  onSelect,
  verifiedSpans,
  onSpanClick,
}) => {
  const categoryClass = finding.category.toLowerCase()
  const confidenceClass = finding.confidence.toLowerCase()

  return (
    <div
      className={`finding-card ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Finding ${index + 1}: ${finding.title}`}
    >
      <div className="finding-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`category-badge ${categoryClass}`}>
            {finding.category}
          </span>
          <span className="finding-title">{finding.title}</span>
        </div>

        <div>
          <span className={`confidence-badge ${confidenceClass}`} title={`Confidence Level: ${finding.confidence}`}>
            CONFIDENCE // {finding.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="finding-body">
        {/* Exact Cited Source Passage */}
        <div className="finding-section explicit-text">
          <div className="section-label">SOURCE PASSAGE // EXACT EXCERPT</div>
          <div>"{finding.explicit_text}"</div>
        </div>

        {/* Plain Language Interpretation */}
        <div className="finding-section explanation">
          <div className="section-label" style={{ color: '#2D6A4F' }}>
            PLAIN-LANGUAGE INTERPRETATION
          </div>
          <div>{finding.plain_language_explanation}</div>
        </div>

        {/* Potential Concern / Risk */}
        {finding.possible_concern && (
          <div className="finding-section concern">
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#92400E' }}>
              <AlertTriangleIcon />
              <span>POTENTIAL RISK // CONTRACTUAL IMBALANCE</span>
            </div>
            <div>{finding.possible_concern}</div>
          </div>
        )}

        {/* Uncertainty / Missing Evidence */}
        {finding.uncertainty && (
          <div className="finding-section uncertainty">
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991B1B' }}>
              <HelpCircleIcon />
              <span>AMBIGUITY // MISSING SCOPE OR EVIDENCE</span>
            </div>
            <div>{finding.uncertainty}</div>
          </div>
        )}

        {/* Verified source citations */}
        {finding.source_span_ids.length > 0 && (
          <div style={{ marginTop: '6px' }}>
            <div className="section-label">ANCHORED SOURCE SPANS:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {finding.source_span_ids.map((spanId) => {
                const span = verifiedSpans[spanId]
                const pageLabel = span?.page ? `PAGE ${span.page}` : 'TXT'
                return (
                  <button
                    key={spanId}
                    type="button"
                    className="page-badge"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onSpanClick) onSpanClick(spanId)
                    }}
                    title={`Inspect verified span ${spanId}`}
                    style={{ cursor: 'pointer' }}
                  >
                    📄 {pageLabel} [{spanId}]
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Suggested questions for legal counsel */}
        {finding.suggested_questions && finding.suggested_questions.length > 0 && (
          <div style={{ marginTop: '6px' }}>
            <div className="section-label">PREPARED COUNSEL INQUIRIES:</div>
            <div className="suggested-questions">
              {finding.suggested_questions.map((q, idx) => (
                <div key={idx} className="suggested-question">
                  → {q}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
