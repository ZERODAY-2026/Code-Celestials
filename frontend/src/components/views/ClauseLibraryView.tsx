import React, { useState } from 'react'
import { STANDARD_CLAUSES, StandardClause } from '../../data/clauseLibrary'

interface ClauseLibraryViewProps {
  onInsertClause?: (clause: StandardClause) => void
}

export const ClauseLibraryView: React.FC<ClauseLibraryViewProps> = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = ['all', 'Confidentiality', 'Liability', 'Termination', 'Indemnification', 'Intellectual Property', 'Data Protection', 'Governing Law']

  const filteredClauses = STANDARD_CLAUSES.filter((c) => {
    const matchCat = selectedCategory === 'all' || c.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchSearch =
      search === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.standardText.toLowerCase().includes(search.toLowerCase()) ||
      c.guidance.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E9E7',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Standard Legal Clause Library
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Curated repository of market-standard, vetted legal provisions for commercial contract redlining and benchmarking.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search standard clauses & guidance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              width: '280px',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#0D382B' : '#E5E9E7',
                background: selectedCategory === cat ? '#0D382B' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Provisions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredClauses.map((clause) => (
          <div
            key={clause.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E9E7',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: '#EDF5F2',
                    color: '#0D382B',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {clause.category}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                  {clause.title}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: clause.stance.includes('Balanced') ? '#E0F2FE' : clause.stance.includes('Customer') ? '#D1FAE5' : '#FEF3C7',
                    color: clause.stance.includes('Balanced') ? '#0369A1' : clause.stance.includes('Customer') ? '#047857' : '#B45309',
                  }}
                >
                  {clause.stance}
                </span>
              </div>

              <button
                type="button"
                className="counsel-btn-white"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                onClick={() => handleCopy(clause.standardText, clause.id)}
              >
                {copiedId === clause.id ? '✓ Copied Clause' : '📋 Copy Language'}
              </button>
            </div>

            {/* Standard Text Box */}
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                color: '#1F2937',
                fontFamily: 'serif',
                marginBottom: '12px',
              }}
            >
              "{clause.standardText}"
            </div>

            {/* Strategic Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.78rem' }}>
              <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                <strong style={{ color: '#166534' }}>💡 Strategic Guidance:</strong>
                <p style={{ color: '#14532D', marginTop: '2px' }}>{clause.guidance}</p>
              </div>

              <div style={{ background: '#FFFBEB', padding: '10px 12px', borderRadius: '6px', border: '1px solid #FEF3C7' }}>
                <strong style={{ color: '#92400E' }}>⚠️ Risk Vectors to Check:</strong>
                <p style={{ color: '#78350F', marginTop: '2px' }}>{clause.riskNotes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
