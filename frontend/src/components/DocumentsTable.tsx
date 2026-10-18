import React from 'react'

export interface DocumentRow {
  id: string
  title: string
  counterparty: string
  version: string
  fileType: 'pdf' | 'docx' | 'txt'
  pages: number
  lastModified: string
  status: 'Needs Review' | 'Processing' | 'Risk Found' | 'Reviewed'
  isLocalUpload?: boolean
  fileBytes?: any
}

interface DocumentsTableProps {
  documents: DocumentRow[]
  onSelectDocument: (doc: DocumentRow) => void
  onViewAll?: () => void
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  onSelectDocument,
  onViewAll,
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Needs Review':
        return 'needs-review'
      case 'Processing':
        return 'processing'
      case 'Risk Found':
        return 'risk-found'
      case 'Reviewed':
        return 'reviewed'
      default:
        return 'needs-review'
    }
  }

  return (
    <div className="counsel-card">
      <div className="counsel-card-header">
        <h3 className="counsel-card-title">Recent Documents</h3>
        <span className="counsel-link-arrow" onClick={onViewAll}>
          <span>View all</span>
          <span>→</span>
        </span>
      </div>

      <div className="counsel-table-wrapper">
        <table className="counsel-table">
          <thead>
            <tr>
              <th>DOCUMENT</th>
              <th>TYPE</th>
              <th>PAGES</th>
              <th>LAST MODIFIED</th>
              <th>STATUS</th>
              <th style={{ width: '32px' }}></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className="counsel-doc-cell">
                    <div className={`counsel-file-badge ${doc.fileType}`}>
                      {doc.fileType.toUpperCase()}
                    </div>
                    <div>
                      <div className="counsel-doc-name">{doc.title}</div>
                      <div className="counsel-doc-meta">
                        <span>{doc.counterparty}</span>
                        <span className="counsel-version-tag">{doc.version}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform: 'uppercase', fontWeight: 500 }}>
                  {doc.fileType}
                </td>
                <td style={{ fontWeight: 500 }}>{doc.pages}</td>
                <td>{doc.lastModified}</td>
                <td>
                  <span className={`counsel-status-pill ${getStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '1rem',
                      lineHeight: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDocument(doc)
                    }}
                  >
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
