import React from 'react'
import type { AnalysisResult } from '../types'
import { HelpCircleIcon, ShieldIcon } from './Icons'

interface SummaryCardProps {
  analysis: AnalysisResult
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ analysis }) => {
  return (
    <div className="summary-card">
      <h2>
        <span>📋</span> EXECUTIVE DOCUMENT DOSSIER
      </h2>
      <p className="summary-text">{analysis.document_summary}</p>

      {analysis.escalation_recommended && (
        <div className="escalation-banner">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ color: 'var(--accent-terracotta)', flexShrink: 0, marginTop: '2px' }}>
              <ShieldIcon />
            </div>
            <div>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-terracotta)' }}>
                ▲ FORMAL COUNSEL ESCALATION RECOMMENDED
              </strong>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>
                {analysis.escalation_reason ||
                  'This agreement imposes asymmetrical liabilities, indemnification covenants, or unilateral termination terms. Definitive legal review by qualified counsel is recommended prior to signature.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {analysis.document_silence && analysis.document_silence.length > 0 && (
        <div className="silence-section">
          <h3>
            <HelpCircleIcon />
            <span>DOCUMENT SILENCE // OMISSIONS & UNADDRESSED TERMS</span>
          </h3>
          <ul className="silence-list">
            {analysis.document_silence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
