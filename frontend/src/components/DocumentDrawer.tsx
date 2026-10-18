import React, { useState } from 'react'
import type { AnalysisResult, DocumentExtraction, Finding, SourceSpan, QuestionResponse } from '../types'
import { DocumentViewer } from './DocumentViewer'
import { QuestionPanel } from './QuestionPanel'
import { FindingCard } from './FindingCard'
import { SummaryCard } from './SummaryCard'

interface DocumentDrawerProps {
  isOpen: boolean
  onClose: () => void
  docTitle: string
  docType: string
  docStatus: string
  extraction: DocumentExtraction | null
  analysis: AnalysisResult | null
  verifiedSpans: Record<string, SourceSpan>
  isAnalyzing: boolean
  onRunAnalysis: () => void
  onAskQuestion: (q: string) => Promise<QuestionResponse>
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  docTitle,
  docType,
  docStatus,
  extraction,
  analysis,
  verifiedSpans,
  isAnalyzing,
  onRunAnalysis,
  onAskQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'clauses' | 'text' | 'qa'>('clauses')
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(0)
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null)

  if (!isOpen) return null

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Needs Review':
        return 'needs-review'
      case 'Processing':
        return 'processing'
      case 'Risk Found':
        return 'risk-found'
      case 'Reviewed':
        return 'reviewed'
      default:
        return 'needs-review'
    }
  }

  const selectedFinding =
    selectedFindingIndex !== null && analysis?.findings[selectedFindingIndex]
      ? analysis.findings[selectedFindingIndex]
      : null

  const suggestedQuestions =
    analysis?.findings.flatMap((f) => f.suggested_questions || []) || []

  return (
    <div className="counsel-modal-overlay" onClick={onClose}>
      <div className="counsel-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="counsel-drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`counsel-file-badge ${docType.toLowerCase()}`}>
                {docType.toUpperCase()}
              </span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
                {docTitle}
              </h2>
              <span className={`counsel-status-pill ${getStatusClass(docStatus)}`}>
                {docStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#A7B8B2' }}>
              {extraction ? `${extraction.total_chars.toLocaleString()} chars • ${extraction.spans.length} source spans` : 'Ready for local inspection'}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.6rem',
              color: '#A7B8B2',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ padding: '8px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`counsel-quick-action ${activeTab === 'clauses' ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                margin: 0,
                fontSize: '0.78rem',
                backgroundColor: activeTab === 'clauses' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: activeTab === 'clauses' ? '#FFFFFF' : 'var(--text-secondary)',
                borderColor: activeTab === 'clauses' ? 'var(--accent-emerald)' : 'var(--border-card)',
              }}
              onClick={() => setActiveTab('clauses')}
            >
              Clause Intelligence ({analysis?.findings.length || 0})
            </button>
            <button
              type="button"
              className={`counsel-quick-action ${activeTab === 'text' ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                margin: 0,
                fontSize: '0.78rem',
                backgroundColor: activeTab === 'text' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: activeTab === 'text' ? '#FFFFFF' : 'var(--text-secondary)',
                borderColor: activeTab === 'text' ? 'var(--accent-emerald)' : 'var(--border-card)',
              }}
              onClick={() => setActiveTab('text')}
            >
              Extracted Text
            </button>
            <button
              type="button"
              className={`counsel-quick-action ${activeTab === 'qa' ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                margin: 0,
                fontSize: '0.78rem',
                backgroundColor: activeTab === 'qa' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: activeTab === 'qa' ? '#FFFFFF' : 'var(--text-secondary)',
                borderColor: activeTab === 'qa' ? 'var(--accent-emerald)' : 'var(--border-card)',
              }}
              onClick={() => setActiveTab('qa')}
            >
              Ask CounselDesk
            </button>
          </div>

          {!analysis && !isAnalyzing && (
            <button
              type="button"
              className="counsel-btn-add"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              onClick={onRunAnalysis}
            >
              Run AI Analysis
            </button>
          )}

          {isAnalyzing && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              Analyzing with Gemma 3n...
            </span>
          )}
        </div>

        {/* Drawer Body */}
        <div className="counsel-drawer-body">
          {activeTab === 'clauses' && (
            <div>
              {analysis && <SummaryCard analysis={analysis} />}

              {analysis?.findings && analysis.findings.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                      }}
                    >
                      Audited Provisions & Key Legal Risks
                    </h3>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#34D399',
                        fontWeight: 600,
                        background: 'rgba(52, 211, 153, 0.12)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {analysis.findings.length} Provisions
                    </span>
                  </div>
                  {analysis.findings.map((finding, idx) => (
                    <FindingCard
                      key={idx}
                      finding={finding}
                      index={idx}
                      isSelected={selectedFindingIndex === idx}
                      onSelect={() => {
                        setSelectedFindingIndex(idx)
                        if (finding.source_span_ids.length > 0) {
                          setSelectedSpanId(finding.source_span_ids[0])
                        }
                      }}
                      verifiedSpans={verifiedSpans}
                      onSpanClick={(spanId) => setSelectedSpanId(spanId)}
                    />
                  ))}
                </div>
              ) : !isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                    No analysis results generated yet for this document.
                  </p>
                  <button
                    type="button"
                    className="counsel-btn-add"
                    onClick={onRunAnalysis}
                  >
                    Analyze with Local Gemma 3n
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'text' && extraction && (
            <DocumentViewer
              extraction={extraction}
              selectedSpan={selectedSpanId ? verifiedSpans[selectedSpanId] || null : null}
              activeFindingText={selectedFinding?.explicit_text || null}
            />
          )}

          {activeTab === 'qa' && (
            <QuestionPanel
              sessionId={extraction?.filename || 'default'}
              onAsk={onAskQuestion}
              suggestedQuestions={suggestedQuestions}
            />
          )}
        </div>
      </div>
    </div>
  )
}
