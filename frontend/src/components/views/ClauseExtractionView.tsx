import React, { useState } from 'react'
import type { AnalysisResult, Finding, QuestionResponse, SourceSpan } from '../../types'
import { DocumentRow } from '../DocumentsTable'
import { QuestionPanel } from '../QuestionPanel'

interface ClauseExtractionViewProps {
  documents: DocumentRow[]
  selectedDoc: DocumentRow | null
  analysis: AnalysisResult | null
  verifiedSpans?: Record<string, SourceSpan>
  onSelectDoc: (doc: DocumentRow) => void
  onOpenUpload: () => void
  onRunAnalysis: () => void
  onAskQuestion?: (q: string) => Promise<QuestionResponse>
  onSpanClick?: (spanId: string) => void
  onNavigateToContract?: (spanId?: string) => void
}

export const ClauseExtractionView: React.FC<ClauseExtractionViewProps> = ({
  documents,
  selectedDoc,
  analysis,
  verifiedSpans = {},
  onSelectDoc,
  onOpenUpload,
  onRunAnalysis,
  onAskQuestion,
  onSpanClick,
  onNavigateToContract,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [clauseSearch, setClauseSearch] = useState<string>('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [externalQuestion, setExternalQuestion] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: 'All Clauses' },
    { id: 'confidentiality', label: 'Confidentiality' },
    { id: 'obligation', label: 'Obligation' },
    { id: 'liability', label: 'Liability' },
    { id: 'termination', label: 'Termination' },
    { id: 'deadline', label: 'Deadline' },
    { id: 'other', label: 'Other Terms' },
  ]

  const defaultClauseInquiries = [
    { icon: '⏳', label: 'What are all notice periods and termination conditions?' },
    { icon: '💰', label: 'What payment terms, invoicing, and late fees are mandated?' },
    { icon: '🔐', label: 'What is the confidentiality survival period and trade secrets rule?' },
    { icon: '⚡', label: 'What remedies exist if either party commits a material breach?' },
    { icon: '⚖️', label: 'What representations, warranties, or liability exclusions apply?' },
    { icon: '🏛️', label: 'What governing law and dispute forums are established?' },
  ]

  const findings = analysis?.findings || []

  const filteredClauses = findings.filter((f) => {
    const matchCat =
      selectedCategory === 'all' || f.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchSearch =
      clauseSearch === '' ||
      f.title.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      f.explicit_text.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      f.plain_language_explanation.toLowerCase().includes(clauseSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const copyClause = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleAskAboutClause = (clause: Finding) => {
    const q = `Explain the practical legal implications and obligations under this ${clause.category} clause: "${clause.title}". What should counsel watch out for?`
    setExternalQuestion(q)
  }

  if (documents.length === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E9E7',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📑</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          No Document Available for Clause Extraction
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Upload or select a legal contract to extract, classify, and index key legal provisions.
        </p>
        <button type="button" className="counsel-btn-add" onClick={onOpenUpload}>
          + Upload Document
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Selector */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5563' }}>
            Extracting from:
          </span>
          <select
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              background: '#F9FAFB',
              cursor: 'pointer',
            }}
            value={selectedDoc?.id || ''}
            onChange={(e) => {
              const found = documents.find((d) => d.id === e.target.value)
              if (found) onSelectDoc(found)
            }}
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.counterparty})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
            {findings.length} Provisions Indexed
          </span>
          {!analysis && (
            <button
              type="button"
              className="counsel-btn-add"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={onRunAnalysis}
            >
              ⚡ Extract Clauses
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === c.id ? '#0D382B' : '#E5E9E7',
                background: selectedCategory === c.id ? '#0D382B' : '#FFFFFF',
                color: selectedCategory === c.id ? '#FFFFFF' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search extracted clauses..."
          value={clauseSearch}
          onChange={(e) => setClauseSearch(e.target.value)}
          style={{
            padding: '6px 14px',
            fontSize: '0.84rem',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            width: '260px',
            outline: 'none',
          }}
        />
      </div>

      {/* Main Two-Column Layout: Left = Extracted Clauses, Right = Gemma 3n Chatbot Assistant */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(380px, 0.85fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Clauses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!analysis ? (
            <div
              style={{
                background: '#FFFFFF',
                padding: '48px',
                borderRadius: '10px',
                border: '1px solid #E5E9E7',
                textAlign: 'center',
                color: '#6B7280',
              }}
            >
              <p style={{ marginBottom: '12px' }}>No clauses extracted yet for this document.</p>
              <button type="button" className="counsel-btn-add" onClick={onRunAnalysis}>
                ⚡ Extract Clauses with Gemma 3n
              </button>
            </div>
          ) : filteredClauses.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                padding: '36px',
                borderRadius: '10px',
                border: '1px solid #E5E9E7',
                textAlign: 'center',
                color: '#6B7280',
              }}
            >
              <p>No clauses match the selected category or search query.</p>
            </div>
          ) : (
            filteredClauses.map((clause, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E5E9E7',
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {clause.category}
                    </span>
                    <strong style={{ fontSize: '0.96rem', color: '#111827' }}>
                      {clause.title}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: clause.confidence === 'high' ? '#059669' : '#D97706',
                        background: clause.confidence === 'high' ? '#ECFDF5' : '#FFFBEB',
                        border:
                          clause.confidence === 'high' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {clause.confidence.toUpperCase()} GROUNDING
                    </span>

                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        color: '#374151',
                      }}
                      onClick={() => copyClause(clause.explicit_text, idx)}
                    >
                      {copiedIdx === idx ? '✓ Copied' : '📋 Copy Text'}
                    </button>
                  </div>
                </div>

                {/* Excerpt Passage Quote Box */}
                <div
                  style={{
                    background: '#F8FAF9',
                    borderLeft: '3px solid #0D382B',
                    borderRadius: '0 6px 6px 0',
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#0D382B',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                    }}
                  >
                    📄 Exact Contract Passage:
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#374151',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                    }}
                  >
                    "{clause.explicit_text}"
                  </div>
                </div>

                {/* Plain Language Interpretation */}
                <div style={{ fontSize: '0.84rem', color: '#1F2937', lineHeight: 1.5 }}>
                  <strong style={{ color: '#065F46' }}>Plain Summary: </strong>
                  {clause.plain_language_explanation}
                </div>

                {/* Citations and Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    paddingTop: '8px',
                    borderTop: '1px solid #F3F4F6',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {/* Clickable Citations */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600 }}>
                      Citations:
                    </span>
                    {clause.source_span_ids.map((sid) => {
                      const span = verifiedSpans[sid]
                      return (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => {
                            if (onSpanClick) onSpanClick(sid)
                            if (onNavigateToContract) onNavigateToContract(sid)
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            color: '#065F46',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Inspect this cited passage"
                        >
                          📄 {span?.page ? `Page ${span.page}` : 'Excerpt'} [#{sid.slice(0, 8)}]
                        </button>
                      )
                    })}
                  </div>

                  {/* Ask Chatbot button */}
                  <button
                    type="button"
                    onClick={() => handleAskAboutClause(clause)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      color: '#065F46',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0D382B'
                      e.currentTarget.style.color = '#FFFFFF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F0FDF4'
                      e.currentTarget.style.color = '#065F46'
                    }}
                  >
                    <span>💬</span>
                    <span>Ask Chatbot about this Clause</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Gemma 3n Clause Intelligence Assistant */}
        <div style={{ height: '640px' }}>
          {onAskQuestion ? (
            <QuestionPanel
              sessionId={selectedDoc?.id || 'session'}
              onAsk={onAskQuestion}
              title="Clause Intelligence Assistant"
              subtitle="● Gemma 3n Provision Analysis"
              badgeText="📑 Clause Triage"
              placeholder="Ask a question about clauses, covenants, warranties, breach remedies..."
              customSuggestionsList={defaultClauseInquiries}
              externalQuestion={externalQuestion}
              onClearExternalQuestion={() => setExternalQuestion(null)}
              onSpanClick={onSpanClick}
            />
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E5E9E7',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6B7280',
              }}
            >
              <p>Clause assistant connecting to local Gemma 3n runtime...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClauseExtractionView
