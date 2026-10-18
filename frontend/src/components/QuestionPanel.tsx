import React, { useState } from 'react'
import type { QuestionResponse } from '../types'
import { SendIcon, SparklesIcon } from './Icons'

interface QuestionPanelProps {
  sessionId: string
  onAsk: (question: string) => Promise<QuestionResponse>
  suggestedQuestions?: string[]
  onSpanClick?: (spanId: string) => void
  title?: string
  subtitle?: string
  badgeText?: string
  placeholder?: string
  customSuggestionsList?: { icon: string; label: string }[]
  externalQuestion?: string | null
  onClearExternalQuestion?: () => void
}

interface QAHistoryItem {
  question: string
  response: QuestionResponse
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  onAsk,
  suggestedQuestions = [],
  onSpanClick,
  title,
  subtitle,
  badgeText,
  placeholder,
  customSuggestionsList,
  externalQuestion,
  onClearExternalQuestion,
}) => {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<QAHistoryItem[]>([])

  const defaultSuggestions = customSuggestionsList || [
    { icon: '⏳', label: 'Termination notice periods and conditions' },
    { icon: '⚖️', label: 'Maximum liability caps and indemnity burdens' },
    { icon: '🔄', label: 'Automatic renewal clauses or hidden penalties' },
    { icon: '🏛️', label: 'Governing jurisdiction and dispute resolution' },
    { icon: '🔐', label: 'Confidentiality survival period and exceptions' },
    { icon: '⚡', label: 'What remedies exist in case of material breach?' },
  ]

  const customSuggestions = suggestedQuestions.map((q) => ({
    icon: '📄',
    label: q,
  }))

  const allSuggestions = [
    ...customSuggestions,
    ...defaultSuggestions.filter(
      (d) => !customSuggestions.some((c) => c.label.toLowerCase() === d.label.toLowerCase())
    ),
  ].slice(0, 6)

  const handleSubmit = async (qText: string) => {
    const trimmed = qText.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    setError(null)
    setQuestion('')

    try {
      const resp = await onAsk(trimmed)
      setHistory((prev) => [...prev, { question: trimmed, response: resp }])
    } catch (err: any) {
      setError(err?.message || 'Failed to query local Gemma model.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle external inquiry trigger (e.g. clicking "Ask Chatbot" on a clause or risk)
  React.useEffect(() => {
    if (externalQuestion && externalQuestion.trim() && !isLoading) {
      handleSubmit(externalQuestion)
      if (onClearExternalQuestion) {
        onClearExternalQuestion()
      }
    }
  }, [externalQuestion])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E9E7',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #EDF1EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #FAFCFA 0%, #FFFFFF 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#E6F4EA',
              color: '#0D382B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SparklesIcon />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {title || 'Legal Q&A Assistant'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              {subtitle || '● Gemma 3n On-Device Engine'}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '6px',
            background: '#F0FDF4',
            color: '#15803D',
            border: '1px solid #DCFCE7',
            fontWeight: 600,
          }}
        >
          {badgeText || '🔒 Air-Gapped Loopback'}
        </span>
      </div>

      {/* 2. Chat Conversation Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          background: '#F9FAFB',
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6B7280',
              maxWidth: '420px',
              margin: 'auto',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#E6F4EA',
                color: '#0D382B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                fontSize: '1.4rem',
              }}
            >
              ⚖️
            </div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Ask Any Question About This Contract
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, marginBottom: '20px' }}>
              Gemma 3n reads the document locally and extracts exact cited excerpts to ground every answer.
            </p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* User Bubble */}
              <div
                style={{
                  alignSelf: 'flex-end',
                  background: '#0D382B',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 4px 16px',
                  boxShadow: '0 2px 4px rgba(13,56,43,0.15)',
                  maxWidth: '85%',
                  fontSize: '0.87rem',
                  lineHeight: 1.45,
                }}
              >
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: '#9EB6AD',
                    fontWeight: 600,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  You
                </div>
                {item.question}
              </div>

              {/* Model Response Bubble */}
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#FFFFFF',
                  border: '1px solid #E5E9E7',
                  borderRadius: '16px 16px 16px 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  padding: '16px 20px',
                  maxWidth: '92%',
                  fontSize: '0.87rem',
                  lineHeight: '1.6',
                  color: '#1F2937',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.72rem',
                      color: '#059669',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>✨</span>
                    <span>Grounded Legal Intelligence</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.response.answer)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'color 120ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                    title="Copy response to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>

                <div style={{ color: '#111827', fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.65 }}>
                  {item.response.answer}
                </div>

                {/* Uncertainty Warning if present */}
                {item.response.uncertainty && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: '#FFFBEB',
                      borderLeft: '3px solid #F59E0B',
                      color: '#92400E',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      lineHeight: 1.5,
                    }}
                  >
                    ⚠️ <strong>Document Silence / Qualification:</strong> {item.response.uncertainty}
                  </div>
                )}

                {/* Rich Cited Evidence with Excerpt Previews */}
                {item.response.source_span_ids.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#4B5563',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Cited Evidentiary Excerpts
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                        Click to jump to contract passage
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.response.source_span_ids.map((sId) => {
                        const span = item.response.verified_spans[sId]
                        const cleanText = span?.text?.trim().replace(/\s+/g, ' ') || ''
                        const snippet =
                          cleanText.length > 160 ? cleanText.slice(0, 160) + '...' : cleanText
                        return (
                          <div
                            key={sId}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSpanClick && onSpanClick(sId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                onSpanClick && onSpanClick(sId)
                              }
                            }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: '#F8FAF9',
                              border: '1px solid #E5E9E7',
                              cursor: 'pointer',
                              transition: 'all 140ms ease',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F0FDF4'
                              e.currentTarget.style.borderColor = '#86EFAC'
                              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.04)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#F8FAF9'
                              e.currentTarget.style.borderColor = '#E5E9E7'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                            title="Click to scroll directly to this passage in contract text"
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  color: '#065F46',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <span>📄</span>
                                <span>
                                  {span?.page ? `Section / Page ${span.page}` : 'Contract Provision'}
                                </span>
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  color: '#6B7280',
                                  fontFamily: 'monospace',
                                  background: '#EDF2F0',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{sId.slice(0, 8)}
                              </span>
                            </div>

                            {snippet && (
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#4B5563',
                                  fontStyle: 'italic',
                                  lineHeight: 1.45,
                                  borderLeft: '2px solid #10B981',
                                  paddingLeft: '8px',
                                }}
                              >
                                "{snippet}"
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E9E7',
              maxWidth: '360px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid #D1D5DB',
                borderTopColor: '#0D382B',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>
              Gemma 3n analyzing contract provisions...
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.82rem',
            }}
          >
            <strong>Query Error:</strong> {error}
          </div>
        )}
      </div>

      {/* 3. Bottom Suggested Prompts & Input Box */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #EDF1EF',
          background: '#FFFFFF',
        }}
      >
        {/* Suggested Chips */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6B7280',
              marginBottom: '8px',
            }}
          >
            Suggested Inquiries
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {allSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSubmit(item.label)}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  background: '#F8FAF9',
                  border: '1px solid #E5E9E7',
                  color: '#374151',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 140ms ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#0D382B'
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.borderColor = '#0D382B'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAF9'
                  e.currentTarget.style.color = '#374151'
                  e.currentTarget.style.borderColor = '#E5E9E7'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(question)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F9FAFB',
            border: '1px solid #D1D5DB',
            borderRadius: '10px',
            padding: '6px 10px 6px 14px',
            transition: 'border-color 140ms ease, box-shadow 140ms ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0D382B'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,56,43,0.1)'
            e.currentTarget.style.background = '#FFFFFF'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.background = '#F9FAFB'
          }}
        >
          <input
            type="text"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
              color: '#111827',
              fontFamily: 'inherit',
            }}
            placeholder={
              placeholder ||
              'Ask a question about this contract (e.g. liabilities, notice periods, damages)...'
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: isLoading || !question.trim() ? '#E5E7EB' : '#0D382B',
              color: isLoading || !question.trim() ? '#9CA3AF' : '#FFFFFF',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isLoading || !question.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 120ms ease',
            }}
          >
            <SendIcon />
            <span>Ask Gemma</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuestionPanel
