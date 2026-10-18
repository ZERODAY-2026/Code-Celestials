import React, { useState } from 'react'
import type { AnalysisResult, DocumentExtraction, Finding, HealthResponse } from '../../types'
import { MetricCards } from '../MetricCards'
import { DocumentsTable, DocumentRow } from '../DocumentsTable'
import { PrivacyBanner } from '../PrivacyBanner'
import { InsightsRail } from '../InsightsRail'
import { SAMPLE_CONTRACTS, SampleContract } from '../../data/sampleContracts'

interface DocumentsViewProps {
  documents: DocumentRow[]
  selectedDoc: DocumentRow | null
  health: HealthResponse | null
  searchQuery: string
  statusFilter: string | null
  onSearchChange: (q: string) => void
  onFilterStatus: (s: string | null) => void
  onSelectDocument: (doc: DocumentRow) => void
  onDeleteDocument: (id: string) => void
  onOpenUpload: () => void
  onLoadSample: (sample: SampleContract) => void
  onOpenDrawer: () => void
  analysis: AnalysisResult | null
  dynamicFindings?: Finding[]
  isAnalyzing: boolean
  onNavigateTab?: (tab: string) => void
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  selectedDoc,
  health,
  searchQuery,
  statusFilter,
  onSearchChange,
  onFilterStatus,
  onSelectDocument,
  onDeleteDocument,
  onOpenUpload,
  onLoadSample,
  onOpenDrawer,
  analysis,
  dynamicFindings,
  isAnalyzing,
  onNavigateTab,
}) => {
  const [showSamplePicker, setShowSamplePicker] = useState(false)

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === null || doc.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const needsReviewCount = documents.filter((d) => d.status === 'Needs Review').length
  const inReviewCount = documents.filter((d) => d.status === 'Processing').length
  const reviewedCount = documents.filter((d) => d.status === 'Reviewed').length
  const risksFoundCount = documents.filter((d) => d.status === 'Risk Found').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Metric Stat Cards */}
      <MetricCards
        needsReviewCount={needsReviewCount}
        inReviewCount={inReviewCount}
        reviewedCount={reviewedCount}
        risksFoundCount={risksFoundCount}
        onFilterStatus={onFilterStatus}
      />

      {/* Main Split: Left Documents Table / Empty State + Right Insights */}
      <div className="counsel-content-grid">
        <div className="counsel-content-left">
          {documents.length === 0 ? (
            /* Elegant Empty State when no dummy documents exist */
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-card)',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-bg)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto',
                  border: '1px solid var(--accent-emerald-border)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                No Contracts Loaded Yet
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Upload your PDF, DOCX, or text contracts to perform local, 100% private legal intelligence triage using Gemma 3n.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="counsel-btn-add"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                  onClick={onOpenUpload}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Upload Contract File
                </button>

                <button
                  type="button"
                  className="counsel-btn-white"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  onClick={() => setShowSamplePicker(!showSamplePicker)}
                >
                  Try Sample Contract ↓
                </button>
              </div>

              {/* Sample Contracts Selector */}
              {showSamplePicker && (
                <div
                  style={{
                    marginTop: '28px',
                    padding: '20px',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-card)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select a realistic legal agreement to test immediately:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {SAMPLE_CONTRACTS.map((sample) => (
                      <div
                        key={sample.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-card)',
                          borderRadius: '10px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        className="counsel-sample-card"
                        onClick={() => onLoadSample(sample)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="counsel-file-badge txt" style={{ textTransform: 'uppercase' }}>
                            {sample.fileType}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {sample.pages} {sample.pages === 1 ? 'page' : 'pages'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                          {sample.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Party: {sample.counterparty}
                        </div>
                        <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {sample.description}
                        </p>
                        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Load & Analyze →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Documents Table with Real Uploaded Documents */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Showing <strong style={{ color: 'var(--text-main)' }}>{filteredDocs.length}</strong> loaded documents
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="counsel-btn-white"
                    style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                    onClick={() => setShowSamplePicker(!showSamplePicker)}
                  >
                    + Add Sample Contract
                  </button>
                  <button
                    type="button"
                    className="counsel-btn-add"
                    style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                    onClick={onOpenUpload}
                  >
                    + Upload File
                  </button>
                </div>
              </div>

              {showSamplePicker && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '10px' }}>
                    Quick-load sample contract into workspace:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {SAMPLE_CONTRACTS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        className="counsel-btn-white"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={() => {
                          onLoadSample(sample)
                          setShowSamplePicker(false)
                        }}
                      >
                        📄 {sample.title} ({sample.counterparty})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <DocumentsTable
                documents={filteredDocs}
                onSelectDocument={onSelectDocument}
                onDeleteDocument={onDeleteDocument}
                onViewAll={() => onFilterStatus(null)}
              />
            </div>
          )}

          {/* Privacy Assurance Banner */}
          <div style={{ marginTop: '20px' }}>
            <PrivacyBanner
              onLearnMore={() => {
                alert(
                  'Privacy Architecture:\n• 100% on-device local execution\n• Powered by Ollama on loopback (127.0.0.1:11434)\n• Deterministic parser-grounded source spans\n• Zero telemetry, zero cloud fallback'
                )
              }}
            />
          </div>
        </div>

        {/* Right Rail: AI Review Insights & Quick Actions */}
        <InsightsRail
          dynamicFindings={dynamicFindings}
          onQuickAction={(action) => {
            if (action === 'start-review') {
              if (onNavigateTab) onNavigateTab('contract-review')
              else if (selectedDoc) onOpenDrawer()
              else onOpenUpload()
            } else if (action === 'extract-clauses') {
              if (onNavigateTab) onNavigateTab('clause-extraction')
              else if (selectedDoc) onOpenDrawer()
              else onOpenUpload()
            } else if (action === 'generate-report') {
              if (onNavigateTab) onNavigateTab('reports')
              else onOpenDrawer()
            }
          }}
          onViewAllInsights={onOpenDrawer}
        />
      </div>
    </div>
  )
}
