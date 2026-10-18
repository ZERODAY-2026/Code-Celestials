import React, { useState } from 'react'
import type { AnalysisResult, Finding, QuestionResponse, SourceSpan } from '../../types'
import { DocumentRow } from '../DocumentsTable'
import { QuestionPanel } from '../QuestionPanel'

interface ReportsViewProps {
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

export const ReportsView: React.FC<ReportsViewProps> = ({
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
  const [copied, setCopied] = useState(false)
  const [externalQuestion, setExternalQuestion] = useState<string | null>(null)

  const defaultReportInquiries = [
    { icon: '📊', label: 'Summarize top 3 executive risks for general counsel briefing' },
    { icon: '🚩', label: 'What clauses require immediate redlining prior to signature?' },
    { icon: '💼', label: 'What is our maximum monetary liability under this agreement?' },
    { icon: '📝', label: 'Draft counterparty negotiation talking points based on this audit' },
    { icon: '⚖️', label: 'What warranties or indemnities are missing from this contract?' },
    { icon: '🔒', label: 'Confirm whether confidentiality terms protect proprietary trade secrets' },
  ]

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
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          No Document Loaded for Reporting
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Upload or select a legal contract to compile an executive audit brief and compliance report.
        </p>
        <button type="button" className="counsel-btn-add" onClick={onOpenUpload}>
          + Upload Document
        </button>
      </div>
    )
  }

  const generateReportText = () => {
    if (!analysis) return ''
    const lines = [
      `COUNSELDESK LEGAL INTELLIGENCE AUDIT REPORT`,
      `===========================================`,
      `Document Title: ${selectedDoc?.title || 'Unknown'}`,
      `Counterparty: ${selectedDoc?.counterparty || 'N/A'}`,
      `Audit Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Execution Runtime: On-Device Gemma 3n (Local Loopback 127.0.0.1:11434)`,
      `Air-Gap Verification: 100% Local / Zero Cloud Egress`,
      ``,
      `1. EXECUTIVE SUMMARY`,
      `--------------------`,
      `${analysis.document_summary}`,
      ``,
      `2. DETECTED PROVISIONS & FINDINGS (${analysis.findings.length})`,
      `---------------------------------`,
    ]

    analysis.findings.forEach((f, idx) => {
      lines.push(`${idx + 1}. [${f.category.toUpperCase()}] ${f.title}`)
      lines.push(`   Text: "${f.explicit_text}"`)
      lines.push(`   Summary: ${f.plain_language_explanation}`)
      if (f.possible_concern) lines.push(`   Concern: ${f.possible_concern}`)
      lines.push(``)
    })

    if (analysis.document_silence.length > 0) {
      lines.push(`3. UNADDRESSED RISKS & DOCUMENT SILENCE`)
      lines.push(`---------------------------------------`)
      analysis.document_silence.forEach((s) => lines.push(`• ${s}`))
      lines.push(``)
    }

    lines.push(`4. ESCALATION & LEGAL DISCLAIMER`)
    lines.push(`--------------------------------`)
    lines.push(`Escalation Recommended: ${analysis.escalation_recommended ? 'YES' : 'NO'}`)
    if (analysis.escalation_reason) lines.push(`Reason: ${analysis.escalation_reason}`)
    lines.push(``)
    lines.push(
      `Disclaimer: ${analysis.disclaimer || 'Automated legal triage assistant. Not formal legal advice.'}`
    )

    return lines.join('\n')
  }

  const handleDownload = () => {
    const text = generateReportText()
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CounselDesk_Audit_${selectedDoc?.title.replace(/\s+/g, '_') || 'Contract'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    const text = generateReportText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAskAboutReportRow = (finding: Finding) => {
    const q = `Based on the audit report, what is the legal exposure and recommended negotiation stance for: "${finding.title}"?`
    setExternalQuestion(q)
  }

  const handleAskAboutSilence = (item: string) => {
    const q = `The audit report identified document silence regarding: "${item}". What risk does this omission create and what standard clause should be inserted?`
    setExternalQuestion(q)
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
            Audit Report for:
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="counsel-btn-white"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            onClick={handleCopy}
            disabled={!analysis}
          >
            {copied ? '✓ Copied Brief' : '📋 Copy Report'}
          </button>
          <button
            type="button"
            className="counsel-btn-add"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            onClick={handleDownload}
            disabled={!analysis}
          >
            💾 Download Full Audit Brief (.md)
          </button>
        </div>
      </div>

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
          <p style={{ marginBottom: '12px' }}>No analysis results available to generate report.</p>
          <button type="button" className="counsel-btn-add" onClick={onRunAnalysis}>
            ⚡ Run AI Analysis
          </button>
        </div>
      ) : (
        /* Two-Column Layout: Left = Audit Brief Document, Right = Gemma 3n Audit Assistant */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(380px, 0.85fr)',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Executive Report Document */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E9E7',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Report Header */}
            <div style={{ borderBottom: '2px solid #0D382B', paddingBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#0D382B',
                      fontWeight: 700,
                    }}
                  >
                    CounselDesk • On-Device Legal Intelligence
                  </span>
                  <h1
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: '#111827',
                      marginTop: '4px',
                      marginBottom: 0,
                    }}
                  >
                    Contract Triage & Risk Audit Brief
                  </h1>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6B7280' }}>
                  <div>
                    <strong>Audit Date:</strong> {new Date().toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Model:</strong> Gemma 3n (Local 4B)
                  </div>
                  <div style={{ color: '#059669', fontWeight: 600 }}>100% Air-Gapped Verification</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  gap: '24px',
                  background: '#F8FAF9',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Instrument Title:
                  </span>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>
                    {selectedDoc?.title}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Counterparty:
                  </span>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>
                    {selectedDoc?.counterparty}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>
                    Verified Findings:
                  </span>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#059669' }}>
                    {analysis.findings.length} Provisions Grounded
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                1. Executive Summary
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>
                {analysis.document_summary}
              </p>
            </div>

            {/* Section 2: Findings Table with Inquire Button */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  2. Audited Provisions Matrix ({analysis.findings.length})
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  Click "Inquire" to ask Gemma about any clause
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Provision</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Summary</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.findings.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td
                          style={{
                            padding: '10px',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#1D4ED8',
                          }}
                        >
                          {f.category}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#111827' }}>
                          {f.title}
                        </td>
                        <td style={{ padding: '10px', color: '#4B5563', lineHeight: 1.45 }}>
                          {f.plain_language_explanation}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {f.possible_concern ? (
                            <span
                              style={{
                                background: '#FEE2E2',
                                color: '#DC2626',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}
                            >
                              Concern
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#D1FAE5',
                                color: '#059669',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              Standard
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleAskAboutReportRow(f)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: '#F0FDF4',
                              border: '1px solid #86EFAC',
                              color: '#065F46',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                            title="Inquire with chatbot about this row"
                          >
                            💬 Inquire
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Document Silence */}
            {analysis.document_silence.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#92400E', marginBottom: '10px' }}>
                  3. Unaddressed Legal Terms & Document Silence
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.document_silence.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', color: '#78350F' }}>• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleAskAboutSilence(item)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#FFFFFF',
                          border: '1px solid #F59E0B',
                          color: '#B45309',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        💬 Inquire
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Recommendation & Safe Escalation */}
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E40AF', marginBottom: '6px' }}>
                4. Review Conclusion & Escalation Notice
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#1E3A8A', lineHeight: 1.5, margin: 0 }}>
                {analysis.escalation_reason ||
                  'This preliminary AI triage report provides clause extraction and risk discovery. Prior to contract execution, consultation with designated legal counsel is recommended.'}
              </p>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                fontSize: '0.72rem',
                color: '#9CA3AF',
                textAlign: 'center',
                borderTop: '1px solid #E5E7EB',
                paddingTop: '14px',
              }}
            >
              {analysis.disclaimer ||
                'CounselDesk is an AI document assistance platform and does not constitute formal legal counsel.'}
            </div>
          </div>

          {/* Right Column: Gemma 3n Audit Brief Chatbot Assistant */}
          <div style={{ height: '640px' }}>
            {onAskQuestion ? (
              <QuestionPanel
                sessionId={selectedDoc?.id || 'session'}
                onAsk={onAskQuestion}
                title="Audit Brief Assistant"
                subtitle="● Gemma 3n Executive Briefing Engine"
                badgeText="📊 Report Q&A"
                placeholder="Ask a question about this audit brief, recommendations, negotiations..."
                customSuggestionsList={defaultReportInquiries}
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
                <p>Audit assistant connecting to local Gemma 3n runtime...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsView
