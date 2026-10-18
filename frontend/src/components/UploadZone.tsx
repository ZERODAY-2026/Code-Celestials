import React, { useRef, useState } from 'react'
import { UploadCloudIcon, AlertTriangleIcon } from './Icons'

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
  error: string | null
}

const ALLOWED_EXTENSIONS = ['.pdf', '.txt']
const MAX_FILE_SIZE_MB = 25

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileUpload,
  isLoading,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndProceed = (file: File) => {
    setValidationError(null)

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `Unsupported format (${ext || 'unknown'}). Supply a PDF (.pdf) or Plain Text (.txt) file.`
      )
      return
    }

    if (file.size === 0) {
      setValidationError('The selected document payload is empty (0 bytes).')
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(
        `Document payload exceeds ${MAX_FILE_SIZE_MB}MB constraint.`
      )
      return
    }

    onFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProceed(e.dataTransfer.files[0])
    }
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload legal document"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          className="upload-input"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndProceed(e.target.files[0])
            }
          }}
          disabled={isLoading}
        />

        <div className="upload-zone-content">
          <div className="upload-tag">
            <span>●</span> INGESTION PIPELINE // DRAG & DROP
          </div>

          <div className="upload-title">
            {isLoading ? 'Processing Document Source Spans...' : 'Drop contract or legal instrument for structural analysis'}
          </div>

          <p className="upload-subtitle">
            Upload PDF or TXT legal agreements. Text extraction via PyMuPDF with page-level offset mapping, evaluated entirely on local hardware.
          </p>

          <div className="upload-formats">
            <span className="format-badge">PDF // PAGE-AWARE</span>
            <span className="format-badge">TXT // LINE-INDEXED</span>
            <span className="format-badge">100% AIR-GAPPED</span>
            <span className="format-badge">ZERO CLOUD OCR</span>
          </div>

          {isLoading && (
            <div style={{ marginTop: '28px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
              <div className="loading-text">Constructing Immutable Source Spans...</div>
              <div className="loading-subtext">// CALCULATING SHA-256 CHECKSUM & OFFSET RANGES</div>
            </div>
          )}
        </div>
      </div>

      {(validationError || error) && (
        <div className="error-state" style={{ marginTop: '16px' }}>
          <div className="error-title">▲ Ingestion Diagnostic Error</div>
          <div className="error-message">{validationError || error}</div>
        </div>
      )}
    </div>
  )
}
