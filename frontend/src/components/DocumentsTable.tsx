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
  onDeleteDocument?: (id: string) => void
  onViewAll?: () => void
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
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
              <th style={{ width: '42px' }}>ACTIONS</th>
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
                    className="counsel-row-delete-btn"
                    title="Remove document"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onDeleteDocument) {
                        onDeleteDocument(doc.id)
                      }
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
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
