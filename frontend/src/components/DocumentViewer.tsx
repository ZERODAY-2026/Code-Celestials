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
  const renderedContent = useMemo(() => {
    const fullText = extraction.full_text || ''

    if (selectedSpan && selectedSpan.text) {
      const target = selectedSpan.text.trim()
      const idx = fullText.indexOf(target)
      if (idx !== -1) {
        const before = fullText.slice(0, idx)
        const match = fullText.slice(idx, idx + target.length)
        const after = fullText.slice(idx + target.length)
        return (
          <>
            {before}
            <mark
              className="highlight"
              style={{
                backgroundColor: '#FEF08A',
                color: '#1E1E1C',
                border: '1px solid #EAB308',
                padding: '2px 4px',
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
      const idx = fullText.toLowerCase().indexOf(target.toLowerCase())
      if (idx !== -1) {
        const before = fullText.slice(0, idx)
        const match = fullText.slice(idx, idx + target.length)
        const after = fullText.slice(idx + target.length)
        return (
          <>
            {before}
            <mark
              className="highlight"
              style={{
                backgroundColor: '#FED7AA',
                color: '#7C2D12',
                border: '1px solid #F97316',
                padding: '2px 4px',
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

  return (
    <div className="evidence-panel">
      <div className="evidence-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpenIcon />
          <span className="evidence-panel-title">
            SOURCE TEXT REPOSITORY [{extraction.filename.toUpperCase()}]
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {extraction.total_pages ? `${extraction.total_pages} PAGES` : 'PLAIN TEXT'} // {extraction.total_chars.toLocaleString()} CHARS
        </span>
      </div>

      <div className="evidence-panel-body">
        <div className="text-viewer" style={{ maxHeight: '100%', height: 'calc(100vh - 360px)' }}>
          {renderedContent}
        </div>
      </div>
    </div>
  )
}
