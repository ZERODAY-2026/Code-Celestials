import React from 'react'
import type { AnalysisResult } from '../types'
import { HelpCircleIcon, ShieldIcon } from './Icons'

interface SummaryCardProps {
  analysis: AnalysisResult
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ analysis }) => {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E9E7',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F3F4F6',
          paddingBottom: '12px',
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
              fontSize: '1rem',
            }}
          >
            📋
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Executive Legal Brief
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              ● Verified by Local Gemma 3n Intelligence
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            padding: '3px 9px',
            borderRadius: '6px',
            background: '#F0FDF4',
            color: '#15803D',
            border: '1px solid #DCFCE7',
            fontWeight: 600,
          }}
        >
          🔒 Air-Gapped Verification
        </span>
      </div>

      {/* Summary Narrative */}
      <p
        style={{
          fontSize: '0.88rem',
          lineHeight: 1.65,
          color: '#374151',
          margin: 0,
        }}
      >
        {analysis.document_summary}
      </p>

      {/* Escalation Recommendation Banner */}
      {analysis.escalation_recommended && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }}>
            <ShieldIcon />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#991B1B',
                marginBottom: '4px',
              }}
            >
              Formal Legal Escalation Recommended
            </div>
            <p style={{ fontSize: '0.82rem', color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
              {analysis.escalation_reason ||
                'This agreement imposes asymmetrical liabilities, indemnification burdens, or unilateral rights. Professional review by qualified legal counsel is advised prior to execution.'}
            </p>
          </div>
        </div>
      )}

      {/* Document Silence & Unaddressed Terms */}
      {analysis.document_silence && analysis.document_silence.length > 0 && (
        <div
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#4B5563',
              marginBottom: '8px',
            }}
          >
            <HelpCircleIcon style={{ width: '15px', height: '15px', color: '#6B7280' }} />
            <span>Unaddressed Terms & Document Silence ({analysis.document_silence.length})</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '0.82rem',
              color: '#4B5563',
              lineHeight: 1.6,
            }}
          >
            {analysis.document_silence.map((item, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: idx === analysis.document_silence.length - 1 ? 0 : '4px',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SummaryCard
