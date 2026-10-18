import React, { useRef, useState } from 'react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  isLoading: boolean
  error: string | null
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = (file: File) => {
    onUpload(file)
  }

  return (
    <div className="counsel-modal-overlay" onClick={onClose}>
      <div className="counsel-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
              Add Legal Document
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#A7B8B2', marginTop: '2px' }}>
              Upload a PDF or TXT contract for local issue-spotting and triage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: '#A7B8B2',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            border: `2px dashed ${isDragging ? '#34D399' : '#0F382E'}`,
            borderRadius: '12px',
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: isDragging ? 'rgba(52, 211, 153, 0.08)' : '#041410',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFile(e.dataTransfer.files[0])
            }
          }}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0])
              }
            }}
            disabled={isLoading}
          />

          <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: '#34D399' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
              <path d="M12 12v9"/>
              <path d="m8 16 4-4 4 4"/>
            </svg>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
            {isLoading ? 'Extracting & Ingesting On-Device...' : 'Choose a file or drag & drop here'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A7B8B2', marginBottom: '14px' }}>
            Supports PDF (with page-level citations) and Plain Text documents up to 25MB.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              PDF
            </span>
            <span style={{ background: 'rgba(167, 184, 178, 0.15)', color: '#A7B8B2', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(167, 184, 178, 0.3)' }}>
              TXT
            </span>
            <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              100% LOCAL
            </span>
          </div>

          {isLoading && (
            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid #0F2922',
                  borderTopColor: '#34D399',
                  borderRadius: '50%',
                  margin: '0 auto 8px',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 500 }}>
                Processing with PyMuPDF & Gemma 3n...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="counsel-btn-white"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
