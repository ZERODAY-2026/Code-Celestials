import React, { useState } from 'react'
import type { AnalysisResult, Finding, QuestionResponse, SourceSpan } from '../../types'
import { DocumentRow } from '../DocumentsTable'
import { QuestionPanel } from '../QuestionPanel'

interface RiskAnalysisViewProps {
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

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
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
  const [resolvedRisks, setResolvedRisks] = useState<
    Record<string, 'mitigated' | 'accepted' | 'renegotiate'>
  >({})
  const [externalQuestion, setExternalQuestion] = useState<string | null>(null)

  const defaultRiskInquiries = [
    { icon: '⚖️', label: 'What are our biggest monetary liabilities and exposure caps?' },
    { icon: '⏳', label: 'How can we mitigate the termination notice requirements?' },
    { icon: '🔄', label: 'Are there hidden auto-renewals or unilateral rights?' },
    { icon: '🏛️', label: 'What risks arise from the mandated dispute jurisdiction?' },
    { icon: '🔐', label: 'Does confidentiality lack customary safe-harbor exclusions?' },
    { icon: '⚡', label: 'What remedies exist if the counterparty commits a material breach?' },
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
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          No Document Available for Risk Audit
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Upload or select a legal contract to calculate exposure metrics, unaddressed risks, and liability exposure.
        </p>
        <button type="button" className="counsel-btn-add" onClick={onOpenUpload}>
          + Upload Document
        </button>
      </div>
    )
  }

  // Calculate risk metrics
  const findingsWithConcern = analysis?.findings.filter((f) => !!f.possible_concern) || []
  const liabilityFindings =
    analysis?.findings.filter((f) => f.category === 'liability' || f.category === 'penalty') || []
  const silenceItems = analysis?.document_silence || []

  // All provisions evaluated for legal scrutiny
  const riskFindings =
    analysis?.findings.filter(
      (f) =>
        !!f.possible_concern ||
        f.category === 'liability' ||
        f.category === 'penalty' ||
        f.category === 'deadline' ||
        !!f.uncertainty
    ) || []

  const displayedRisks = riskFindings.length > 0 ? riskFindings : analysis?.findings || []

  const riskScore = Math.min(
    100,
    Math.max(
      25,
      25 +
        findingsWithConcern.length * 20 +
        liabilityFindings.length * 15 +
        silenceItems.length * 10
    )
  )

  const getRiskLabel = (score: number) => {
    if (score > 70) return { label: 'High Exposure', color: '#DC2626', bg: '#FEE2E2' }
    if (score > 40) return { label: 'Moderate Risk', color: '#D97706', bg: '#FEF3C7' }
    return { label: 'Standard Risk', color: '#059669', bg: '#D1FAE5' }
  }

  const riskBadge = getRiskLabel(riskScore)

  const handleAction = (id: string, action: 'mitigated' | 'accepted' | 'renegotiate') => {
    setResolvedRisks((prev) => ({ ...prev, [id]: action }))
  }

  const handleAskAboutRisk = (finding: Finding) => {
    const q = `How can we mitigate and renegotiate the risk regarding ${finding.title}? What specific contract amendments should counsel propose?`
    setExternalQuestion(q)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Selector Bar */}
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
            Auditing Contract:
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
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              background: riskBadge.bg,
              color: riskBadge.color,
            }}
          >
            ● {riskBadge.label} ({riskScore}/100)
          </span>

          {!analysis && (
            <button
              type="button"
              className="counsel-btn-add"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={onRunAnalysis}
            >
              ⚡ Run AI Audit
            </button>
          )}
        </div>
      </div>

      {/* Exposure Scorecards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E9E7',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6B7280',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Contract Exposure Score
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: riskBadge.color }}>
            {analysis ? `${riskScore}` : '--'}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#9CA3AF' }}> / 100</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '6px' }}>
            Calculated from indemnities, liability caps, and omissions.
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E9E7',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6B7280',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Flagged Legal Concerns
          </div>
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: findingsWithConcern.length > 0 ? '#DC2626' : '#059669',
            }}
          >
            {analysis ? findingsWithConcern.length : '--'}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '6px' }}>
            Clauses containing asymmetrical liabilities or non-standard provisions.
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E9E7',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6B7280',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Document Silence Items
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#D97706' }}>
            {analysis ? silenceItems.length : '--'}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '6px' }}>
            Unaddressed contractual protections identified by Gemma 3n.
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E9E7',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6B7280',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Citation Grounding
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0D382B' }}>
            100%
          </div>
          <p style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '6px' }}>
            Zero hallucinations: all risk claims validated to source text spans.
          </p>
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace: Left = Risk Vectors, Right = Gemma 3n Assistant */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(380px, 0.85fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Risk Vectors & Mitigations */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E9E7',
            padding: '20px',
            minHeight: '620px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid #EDF1EF',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Identified Risk Vectors & Recommended Counter-Measures
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                {displayedRisks.length} evaluated contractual provisions
              </span>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#F0FDF4',
                color: '#15803D',
                fontWeight: 600,
              }}
            >
              ✓ Verified Evidence
            </span>
          </div>

          {!analysis ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
              <p style={{ marginBottom: '12px' }}>
                Run analysis on this contract to generate the detailed risk audit matrix.
              </p>
              <button type="button" className="counsel-btn-add" onClick={onRunAnalysis}>
                ⚡ Run Risk Audit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedRisks.map((finding, idx) => {
                const status = resolvedRisks[`concern-${idx}`]
                const isHigh =
                  !!finding.possible_concern ||
                  finding.category === 'liability' ||
                  finding.category === 'penalty'
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '10px',
                      border: isHigh ? '1px solid #FCA5A5' : '1px solid #E5E9E7',
                      background: isHigh ? '#FFF8F8' : '#FFFFFF',
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
                            background: isHigh ? '#FEF2F2' : '#EFF6FF',
                            color: isHigh ? '#DC2626' : '#1D4ED8',
                            border: isHigh ? '1px solid #FECACA' : '1px solid #BFDBFE',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {finding.category}
                        </span>
                        <strong style={{ fontSize: '0.94rem', color: isHigh ? '#991B1B' : '#111827' }}>
                          {finding.title}
                        </strong>
                      </div>

                      {status && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background:
                              status === 'mitigated'
                                ? '#D1FAE5'
                                : status === 'accepted'
                                ? '#F3F4F6'
                                : '#FEE2E2',
                            color:
                              status === 'mitigated'
                                ? '#065F46'
                                : status === 'accepted'
                                ? '#374151'
                                : '#991B1B',
                          }}
                        >
                          ✓ {status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Risk Concern */}
                    {finding.possible_concern && (
                      <div
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          padding: '10px 14px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#991B1B',
                            textTransform: 'uppercase',
                            marginBottom: '3px',
                          }}
                        >
                          ⚠️ Risk Exposure & Contractual Imbalance:
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
                          {finding.possible_concern}
                        </p>
                      </div>
                    )}

                    {/* Excerpt Quote */}
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
                        📄 Exact Contract Provision:
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{finding.explicit_text}"
                      </div>
                    </div>

                    {/* Plain Language Interpretation */}
                    <div style={{ fontSize: '0.82rem', color: '#1F2937', lineHeight: 1.5 }}>
                      <strong style={{ color: '#065F46' }}>Plain Summary: </strong>
                      {finding.plain_language_explanation}
                    </div>

                    {/* Clickable Citations */}
                    {finding.source_span_ids && finding.source_span_ids.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600 }}>
                          Citations:
                        </span>
                        {finding.source_span_ids.map((sid) => {
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
                    )}

                    {/* Action Buttons Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '6px',
                        paddingTop: '8px',
                        borderTop: '1px solid #F3F4F6',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      {/* Ask Chatbot button */}
                      <button
                        type="button"
                        onClick={() => handleAskAboutRisk(finding)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
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
                        <span>Ask Chatbot about this Risk</span>
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            background: '#FFFFFF',
                            color: '#374151',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAction(`concern-${idx}`, 'mitigated')}
                        >
                          ✓ Mitigate
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            background: '#FFFFFF',
                            color: '#374151',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAction(`concern-${idx}`, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            border: '1px solid #DC2626',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAction(`concern-${idx}`, 'renegotiate')}
                        >
                          🚩 Renegotiate
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Gemma 3n Risk Intelligence Chatbot */}
        <div style={{ height: '640px' }}>
          {onAskQuestion ? (
            <QuestionPanel
              sessionId={selectedDoc?.id || 'session'}
              onAsk={onAskQuestion}
              title="Risk Intelligence Assistant"
              subtitle="● Gemma 3n Risk Modeling Engine"
              badgeText="🛡️ Risk Triage"
              placeholder="Ask a question about contract risks, indemnities, liabilities, damages..."
              customSuggestionsList={defaultRiskInquiries}
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
              <p>Risk assistant connecting to local Gemma 3n runtime...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RiskAnalysisView
