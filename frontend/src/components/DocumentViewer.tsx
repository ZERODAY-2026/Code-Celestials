import React, { useMemo } from 'react'
import type { DocumentExtraction, SourceSpan } from '../types'
import { BookOpenIcon } from './Icons'

interface DocumentViewerProps {
  extraction: DocumentExtraction
  selectedSpan: SourceSpan | null
  activeFindingText?: string | null
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  extraction,
  selectedSpan,
  activeFindingText,
}) => {
  // Auto-scroll to highlighted citation whenever selectedSpan or activeFindingText changes
  React.useEffect(() => {
    const el = document.getElementById('active-span-highlight')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedSpan, activeFindingText])

  const renderedContent = useMemo(() => {
    const fullText = extraction.full_text || ''

    if (selectedSpan && selectedSpan.text) {
      const target = selectedSpan.text.trim()
      let idx = fullText.indexOf(target)
      let matchLen = target.length

      // Fallback: check first 40 chars if full span text has whitespace variations
      if (idx === -1 && target.length > 20) {
        const prefix = target.slice(0, 35)
        idx = fullText.indexOf(prefix)
        matchLen = prefix.length
      }

      if (idx !== -1) {
        const before = fullText.slice(0, idx)
        const match = fullText.slice(idx, idx + matchLen)
        const after = fullText.slice(idx + matchLen)
        return (
          <>
            {before}
            <mark
              id="active-span-highlight"
              className="highlight"
              style={{
                backgroundColor: '#FEF08A',
                color: '#1E1E1C',
                border: '2px solid #EAB308',
                borderRadius: '4px',
                padding: '2px 4px',
                fontWeight: 600,
                boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)',
              }}
            >
              {match}
            </mark>
            {after}
          </>
        )
      }
    } else if (activeFindingText && activeFindingText.trim()) {
      const target = activeFindingText.trim()
      let idx = fullText.toLowerCase().indexOf(target.toLowerCase())
      let matchLen = target.length

      if (idx === -1 && target.length > 20) {
        const prefix = target.slice(0, 35).toLowerCase()
        idx = fullText.toLowerCase().indexOf(prefix)
        matchLen = prefix.length
      }

      if (idx !== -1) {
        const before = fullText.slice(0, idx)
        const match = fullText.slice(idx, idx + matchLen)
        const after = fullText.slice(idx + matchLen)
        return (
          <>
            {before}
            <mark
              id="active-span-highlight"
              className="highlight"
              style={{
                backgroundColor: '#FED7AA',
                color: '#7C2D12',
                border: '2px solid #F97316',
                borderRadius: '4px',
                padding: '2px 4px',
                fontWeight: 600,
              }}
            >
              {match}
            </mark>
            {after}
          </>
        )
      }
    }

    return fullText
  }, [extraction, selectedSpan, activeFindingText])

  const cleanTitle = extraction.filename
    .replace(/\.[^/.]+$/, '')
    .replace(/_/g, ' ')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          marginBottom: '12px',
          borderBottom: '1px solid #EDF1EF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#F0FDF4',
              color: '#0D382B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpenIcon />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
              {cleanTitle}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
              Verified Source Text • {extraction.spans.length} Grounded Provisions
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#059669',
            background: '#ECFDF5',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #D1FAE5',
          }}
        >
          ✓ Air-Gapped Local
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#FAFCFA',
          border: '1px solid #E5E9E7',
          borderRadius: '8px',
          padding: '20px 24px',
          fontSize: '0.88rem',
          lineHeight: '1.75',
          color: '#1F2937',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          whiteSpace: 'pre-wrap',
          maxHeight: 'calc(100vh - 360px)',
        }}
      >
        {renderedContent}
      </div>
    </div>
  )
}
