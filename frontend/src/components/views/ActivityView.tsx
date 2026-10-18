import React, { useState } from 'react'

export interface ActivityEvent {
  id: string
  timestamp: string
  type: 'upload' | 'analysis' | 'query' | 'review'
  title: string
  details: string
  badgeText: string
  badgeColor: string
}

interface ActivityViewProps {
  activityList: ActivityEvent[]
  onClearActivity: () => void
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  activityList,
  onClearActivity,
}) => {
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = activityList.filter((a) => {
    if (filterType === 'all') return true
    return a.type === filterType
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Privacy Guarantee Header */}
      <div
        style={{
          background: '#0D382B',
          color: '#FFFFFF',
          borderRadius: '10px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#10B981', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8CAEA2' }}>
              Air-Gapped Audit Trail
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Local Activity & Privacy Verification
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#DCE4E1', maxWidth: '580px', marginTop: '4px' }}>
            Every document parsing step, Gemma 3n reasoning call, and Q&A interaction is executed strictly on <code>127.0.0.1</code>. No document text or telemetry ever leaves this machine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
            onClick={onClearActivity}
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'all', label: `All Activity (${activityList.length})` },
          { id: 'upload', label: 'Uploads' },
          { id: 'analysis', label: 'AI Inferences' },
          { id: 'query', label: 'Q&A Inquiries' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: filterType === tab.id ? '#0D382B' : '#E5E9E7',
              background: filterType === tab.id ? '#0D382B' : '#FFFFFF',
              color: filterType === tab.id ? '#FFFFFF' : '#4B5563',
              cursor: 'pointer',
            }}
            onClick={() => setFilterType(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '0.9rem' }}>No logged activity matches the selected filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: item.badgeColor + '20',
                    color: item.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {item.type === 'upload' ? '📄' : item.type === 'analysis' ? '⚡' : item.type === 'query' ? '💬' : '✓'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>
                      {item.title}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>
                      {item.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4 }}>
                    {item.details}
                  </p>

                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#F3F4F6',
                        color: '#4B5563',
                      }}
                    >
                      {item.badgeText}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
                      ✓ Local Execution Grounded
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
