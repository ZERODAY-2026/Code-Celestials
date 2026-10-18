import React, { useState } from 'react'
import type { AnalysisResult, DocumentExtraction, Finding, SourceSpan, QuestionResponse } from '../../types'
import { DocumentRow } from '../DocumentsTable'
import { DocumentViewer } from '../DocumentViewer'
import { QuestionPanel } from '../QuestionPanel'
import { FindingCard } from '../FindingCard'
import { SummaryCard } from '../SummaryCard'

interface ContractReviewViewProps {
  documents: DocumentRow[]
  selectedDoc: DocumentRow | null
  extraction: DocumentExtraction | null
  analysis: AnalysisResult | null
  verifiedSpans: Record<string, SourceSpan>
  isAnalyzing: boolean
  onSelectDoc: (doc: DocumentRow) => void
  onRunAnalysis: () => void
  onAskQuestion: (q: string) => Promise<QuestionResponse>
  onOpenUpload: () => void
}

export const ContractReviewView: React.FC<ContractReviewViewProps> = ({
  documents,
  selectedDoc,
  extraction,
  analysis,
  verifiedSpans,
  isAnalyzing,
  onSelectDoc,
  onRunAnalysis,
  onAskQuestion,
  onOpenUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'clauses' | 'text' | 'qa'>('clauses')
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(0)
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null)
  const [flaggedFindings, setFlaggedFindings] = useState<Record<number, boolean>>({})

  const selectedFinding =
    selectedFindingIndex !== null && analysis?.findings[selectedFindingIndex]
      ? analysis.findings[selectedFindingIndex]
      : null

  const suggestedQuestions =
    analysis?.findings.flatMap((f) => f.suggested_questions || []) || [
      'What are the termination conditions?',
      'Is there an indemnity clause?',
      'What is the maximum liability cap?',
      'What is the governing jurisdiction?',
    ]

  const toggleFlag = (idx: number) => {
    setFlaggedFindings((prev) => ({ ...prev, [idx]: !prev[idx] }))
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
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚖️</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          No Contract Selected for Review
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Please upload a legal document or select a sample agreement from the Documents tab to initiate deep clause review.
        </p>
        <button type="button" className="counsel-btn-add" onClick={onOpenUpload}>
          + Upload Contract to Review
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Workspace Header */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6B7280', fontWeight: 600 }}>
              Active Contract
            </span>
            <select
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#111827',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <span className={`counsel-status-pill ${selectedDoc?.status === 'Risk Found' ? 'risk-found' : selectedDoc?.status === 'Reviewed' ? 'reviewed' : 'needs-review'}`}>
              {selectedDoc?.status || 'Needs Review'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              {extraction ? `${extraction.total_chars.toLocaleString()} chars • ${extraction.spans.length} verified spans` : 'Ready for triage'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!analysis && (
            <button
              type="button"
              className="counsel-btn-add"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '⚡ Gemma 3n Analyzing...' : '⚡ Run Local AI Review'}
            </button>
          )}

          {analysis && (
            <button
              type="button"
              className="counsel-btn-white"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Re-analyzing...' : '↻ Re-run Analysis'}
            </button>
          )}
        </div>
      </div>

      {/* Main Review Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.1fr) minmax(380px, 0.9fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Full Text / Document Viewer */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E9E7',
            padding: '16px',
            minHeight: '620px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #EDF1EF' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              </svg>
              Contract Text & Source Spans
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              ✓ Deterministic Spans
            </span>
          </div>

          {extraction ? (
            <DocumentViewer
              extraction={extraction}
              selectedSpan={selectedSpanId ? verifiedSpans[selectedSpanId] || null : null}
              activeFindingText={selectedFinding?.explicit_text || null}
            />
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF' }}>
              <p>No document text extracted yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: AI Review Intelligence Panel */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E9E7',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '620px',
          }}
        >
          {/* Sub Navigation */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E5E9E7',
              display: 'flex',
              gap: '8px',
              background: '#F8FAF9',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
            }}
          >
            <button
              type="button"
              className={`counsel-quick-action ${activeTab === 'clauses' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                backgroundColor: activeTab === 'clauses' ? '#0D382B' : '#FFFFFF',
                color: activeTab === 'clauses' ? '#FFFFFF' : '#374151',
                margin: 0,
              }}
              onClick={() => setActiveTab('clauses')}
            >
              Clause Findings ({analysis?.findings.length || 0})
            </button>
            <button
              type="button"
              className={`counsel-quick-action ${activeTab === 'qa' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                backgroundColor: activeTab === 'qa' ? '#0D382B' : '#FFFFFF',
                color: activeTab === 'qa' ? '#FFFFFF' : '#374151',
                margin: 0,
              }}
              onClick={() => setActiveTab('qa')}
            >
              Ask Gemma 3n (Q&A)
            </button>
          </div>

          {/* Tab Body */}
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto', maxHeight: '560px' }}>
            {activeTab === 'clauses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {analysis && <SummaryCard analysis={analysis} />}

                {isAnalyzing && (
                  <div style={{ padding: '30px', textAlign: 'center', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#065F46', marginBottom: '4px' }}>
                      ⚡ Gemma 3n Local Inference Running...
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                      Executing on-device reasoning and citation grounding via Ollama.
                    </div>
                  </div>
                )}

                {analysis?.findings && analysis.findings.length > 0 ? (
                  analysis.findings.map((finding, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <FindingCard
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            border: '1px solid #D1D5DB',
                            background: flaggedFindings[idx] ? '#FEF2F2' : '#FFFFFF',
                            color: flaggedFindings[idx] ? '#DC2626' : '#4B5563',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleFlag(idx)}
                        >
                          {flaggedFindings[idx] ? '🚩 Flagged for Redline' : '⚐ Flag for Redline'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : !isAnalyzing ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280' }}>
                    <p style={{ marginBottom: '12px', fontSize: '0.88rem' }}>
                      No AI analysis results yet for this document.
                    </p>
                    <button
                      type="button"
                      className="counsel-btn-add"
                      onClick={onRunAnalysis}
                    >
                      ⚡ Run Gemma 3n Analysis
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'qa' && (
              <QuestionPanel
                sessionId={extraction?.filename || 'session'}
                onAsk={onAskQuestion}
                suggestedQuestions={suggestedQuestions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
