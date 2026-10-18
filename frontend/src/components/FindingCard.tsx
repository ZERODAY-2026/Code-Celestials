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
  // Category-specific color badge
  const getCategoryTheme = (cat: string) => {
    const c = cat.toLowerCase()
    switch (c) {
      case 'obligation':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Obligation' }
      case 'liability':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Liability' }
      case 'termination':
        return { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', label: 'Termination' }
      case 'confidentiality':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF', label: 'Confidentiality' }
      case 'penalty':
      case 'fee':
        return { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', label: 'Fee & Penalty' }
      case 'right':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Right' }
      case 'deadline':
      case 'renewal':
        return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', label: 'Timeline & Renewal' }
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', label: cat.toUpperCase() }
    }
  }

  const getConfidenceTheme = (conf: string) => {
    switch (conf.toLowerCase()) {
      case 'high':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: '✓ High Grounding' }
      case 'medium':
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: '● Medium Grounding' }
      default:
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: '▲ Preliminary Grounding' }
    }
  }

  const catTheme = getCategoryTheme(finding.category)
  const confTheme = getConfidenceTheme(finding.confidence)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect()
        }
      }}
      aria-label={`Finding ${index + 1}: ${finding.title}`}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: isSelected ? '2px solid #0D382B' : '1px solid #E5E9E7',
        boxShadow: isSelected
          ? '0 4px 12px rgba(13,56,43,0.08)'
          : '0 1px 3px rgba(0,0,0,0.03)',
        padding: '18px 20px',
        marginBottom: '14px',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#CBD5E1'
          e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#E5E9E7'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'
        }
      }}
    >
      {/* 1. Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: catTheme.bg,
              color: catTheme.text,
              border: `1px solid ${catTheme.border}`,
              letterSpacing: '0.02em',
            }}
          >
            {catTheme.label}
          </span>
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111827' }}>
            {finding.title}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            background: confTheme.bg,
            color: confTheme.text,
            border: `1px solid ${confTheme.border}`,
          }}
          title={`Grounded verification level: ${finding.confidence}`}
        >
          {confTheme.label}
        </span>
      </div>

      {/* 2. Plain-Language Explanation */}
      <div>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#065F46',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>💡</span>
          <span>Plain-Language Summary</span>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#1F2937', margin: 0, lineHeight: 1.55 }}>
          {finding.plain_language_explanation}
        </p>
      </div>

      {/* 3. Exact Contract Excerpt */}
      {finding.explicit_text && (
        <div
          style={{
            background: '#F8FAF9',
            borderLeft: '3px solid #0D382B',
            borderRadius: '0 8px 8px 0',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0D382B',
            }}
          >
            📄 Exact Contract Passage
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#374151',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            "{finding.explicit_text}"
          </div>
        </div>
      )}

      {/* 4. Potential Risk Callout */}
      {finding.possible_concern && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#991B1B',
            }}
          >
            <AlertTriangleIcon style={{ width: '14px', height: '14px' }} />
            <span>Risk & Legal Exposure Note</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
            {finding.possible_concern}
          </p>
        </div>
      )}

      {/* 5. Uncertainty / Scope Note */}
      {finding.uncertainty && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#92400E',
            }}
          >
            <HelpCircleIcon style={{ width: '14px', height: '14px' }} />
            <span>Scope Qualification or Ambiguity</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
            {finding.uncertainty}
          </p>
        </div>
      )}

      {/* 6. Anchored Interactive Citations */}
      {finding.source_span_ids.length > 0 && (
        <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Grounded Source Citations:
            </span>
            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
              Click to jump to contract text
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {finding.source_span_ids.map((spanId) => {
              const span = verifiedSpans[spanId]
              const pageLabel = span?.page ? `Page ${span.page}` : 'Excerpt'
              return (
                <button
                  key={spanId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onSpanClick) onSpanClick(spanId)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#065F46',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#DCFCE7'
                    e.currentTarget.style.borderColor = '#86EFAC'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F0FDF4'
                    e.currentTarget.style.borderColor = '#BBF7D0'
                  }}
                  title={`Inspect verified span ${spanId}`}
                >
                  <span>📄 {pageLabel}</span>
                  <span style={{ opacity: 0.6, fontFamily: 'monospace' }}>
                    [#{spanId.slice(0, 8)}]
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 7. Prepared Follow-up Inquiries */}
      {finding.suggested_questions && finding.suggested_questions.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '6px',
            }}
          >
            Suggested Inquiry Angles:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {finding.suggested_questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.76rem',
                  color: '#4B5563',
                  background: '#F9FAFB',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                }}
              >
                → {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FindingCard
