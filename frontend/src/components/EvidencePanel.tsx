import React from 'react'
import type { SourceSpan } from '../types'
import { FileTextIcon } from './Icons'

interface EvidencePanelProps {
  spans: SourceSpan[]
  selectedSpanId: string | null
  filterSpanIds?: string[]
  onSelectSpan?: (spanId: string) => void
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  spans,
  selectedSpanId,
  filterSpanIds,
  onSelectSpan,
}) => {
  const displayedSpans =
    filterSpanIds && filterSpanIds.length > 0
      ? spans.filter((s) => filterSpanIds.includes(s.span_id))
      : spans

  return (
    <div className="evidence-panel">
      <div className="evidence-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileTextIcon />
          <span className="evidence-panel-title">
            VERIFIABLE SOURCE CITATIONS [{displayedSpans.length}]
          </span>
        </div>
        {filterSpanIds && filterSpanIds.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', background: 'var(--accent-terracotta)', color: 'white', padding: '2px 6px' }}>
            FILTERED // SELECTED CLAUSE
          </span>
        )}
      </div>

      <div className="evidence-panel-body">
        {displayedSpans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            // NO CITATIONS MATCH ACTIVE CLAUSE
          </div>
        ) : (
          displayedSpans.map((span) => {
            const isSelected = span.span_id === selectedSpanId
            return (
              <div
                key={span.span_id}
                id={`span-${span.span_id}`}
                className="evidence-span"
                style={{
                  borderColor: isSelected ? 'var(--accent-terracotta)' : 'var(--border-strong)',
                  background: isSelected ? '#FFF8F6' : 'var(--bg-surface)',
                  boxShadow: isSelected ? '3px 3px 0px 0px var(--accent-terracotta)' : 'var(--shadow-brutal-sm)',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectSpan && onSelectSpan(span.span_id)}
              >
                <div className="evidence-span-meta">
                  <span className="page-badge">
                    {span.page ? `PAGE ${span.page}` : 'TXT'}
                  </span>
                  <span>ID: <code>{span.span_id}</code></span>
                  {span.line_start !== null && span.line_start !== undefined && (
                    <span>
                      L: {span.line_start}–{span.line_end || span.line_start}
                    </span>
                  )}
                  <span>
                    O: {span.char_offset_start}..{span.char_offset_end}
                  </span>
                </div>
                <div className="evidence-span-text">{span.text}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
