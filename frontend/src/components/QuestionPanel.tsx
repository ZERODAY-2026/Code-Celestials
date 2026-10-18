import React, { useState } from 'react'
import type { QuestionResponse } from '../types'
import { HelpCircleIcon, SendIcon, SparklesIcon } from './Icons'

interface QuestionPanelProps {
  sessionId: string
  onAsk: (question: string) => Promise<QuestionResponse>
  suggestedQuestions?: string[]
}

interface QAHistoryItem {
  question: string
  response: QuestionResponse
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  onAsk,
  suggestedQuestions = [],
}) => {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<QAHistoryItem[]>([])

  const defaultSuggestions = [
    'What are my termination notice periods and conditions?',
    'Are there any automatic renewal clauses or hidden penalties?',
    'What liability limitations or indemnity burdens apply?',
    'What governing law or jurisdiction resolution is mandated?',
  ]

  const allSuggestions = Array.from(
    new Set([...suggestedQuestions, ...defaultSuggestions])
  ).slice(0, 6)

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

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SparklesIcon />
          <h3 className="card-title">INTERACTIVE CLAUSE INQUIRY</h3>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
          // LOCAL GEMMA3N:4B INTERFACE
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <HelpCircleIcon style={{ width: '28px', height: '28px', margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>
              Query specific obligations, penalty thresholds, deadlines, or jurisdiction terms across the document.
            </p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* User Question */}
              <div
                style={{
                  alignSelf: 'flex-end',
                  background: 'var(--bg-dark)',
                  color: '#FAF9F5',
                  padding: '10px 16px',
                  border: '1px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-brutal-sm)',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.7, marginBottom: '2px' }}>
                  // USER QUERY
                </div>
                {item.question}
              </div>

              {/* Model Response */}
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-brutal-sm)',
                  padding: '14px 18px',
                  maxWidth: '92%',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '4px' }}>
                  ● GROUNDED RESPONSE
                </div>
                <div>{item.response.answer}</div>

                {item.response.uncertainty && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#FEE2E2',
                      borderLeft: '3px solid var(--accent-terracotta)',
                      color: '#991B1B',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ▲ {item.response.uncertainty}
                  </div>
                )}

                {item.response.source_span_ids.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      CITED EVIDENCE:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.response.source_span_ids.map((sId) => {
                        const span = item.response.verified_spans[sId]
                        return (
                          <span key={sId} className="page-badge">
                            📄 {span?.page ? `PAGE ${span.page}` : 'TXT'} [{sId}]
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
            <span>// EVALUATING RETRIEVED SOURCE SPANS...</span>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-title">▲ Query Error</div>
            <div className="error-message">{error}</div>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          PREPARED INQUIRIES:
        </div>
        <div className="suggested-questions">
          {allSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="suggested-question"
              onClick={() => handleSubmit(s)}
              disabled={isLoading}
            >
              → {s}
            </button>
          ))}
        </div>

        <form
          className="question-input-group"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(question)
          }}
        >
          <input
            type="text"
            className="question-input"
            placeholder="Type your inquiry regarding this contract..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !question.trim()}
          >
            <SendIcon />
            <span>Submit</span>
          </button>
        </form>
      </div>
    </div>
  )
}
