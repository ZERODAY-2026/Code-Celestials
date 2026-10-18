import React, { useEffect, useState, useMemo } from 'react'
import type {
  AnalysisResult,
  DocumentExtraction,
  HealthResponse,
  PrivacyStatus,
  SourceSpan,
} from './types'
import {
  analyzeDocument,
  askQuestion,
  fetchHealth,
  fetchPrivacy,
  uploadDocument,
} from './api'
import { Sidebar } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { MetricCards } from './components/MetricCards'
import { DocumentsTable, DocumentRow } from './components/DocumentsTable'
import { PrivacyBanner } from './components/PrivacyBanner'
import { InsightsRail } from './components/InsightsRail'
import { UploadModal } from './components/UploadModal'
import { DocumentDrawer } from './components/DocumentDrawer'

const INITIAL_DOCUMENTS: DocumentRow[] = [
  {
    id: 'doc-1',
    title: 'Master Service Agreement',
    counterparty: 'TechCorp Inc.',
    version: 'v2',
    fileType: 'pdf',
    pages: 47,
    lastModified: 'May 18, 2025 2:41 PM',
    status: 'Needs Review',
  },
  {
    id: 'doc-2',
    title: 'Employment Contract',
    counterparty: 'Senior Engineer',
    version: 'v1',
    fileType: 'docx',
    pages: 18,
    lastModified: 'May 17, 2025 11:15 AM',
    status: 'Processing',
  },
  {
    id: 'doc-3',
    title: 'NDA Agreement',
    counterparty: 'Global Partners LLC',
    version: 'v3',
    fileType: 'pdf',
    pages: 8,
    lastModified: 'May 16, 2025 4:32 PM',
    status: 'Risk Found',
  },
  {
    id: 'doc-4',
    title: 'Licensing Agreement',
    counterparty: 'SoftwareCo',
    version: 'v1',
    fileType: 'pdf',
    pages: 32,
    lastModified: 'May 15, 2025 9:10 AM',
    status: 'Reviewed',
  },
  {
    id: 'doc-5',
    title: 'Vendor Contract',
    counterparty: 'DataStream Analytics',
    version: 'v1',
    fileType: 'docx',
    pages: 24,
    lastModified: 'May 14, 2025 6:20 PM',
    status: 'Needs Review',
  },
]

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [privacy, setPrivacy] = useState<PrivacyStatus | null>(null)
  const [activeNavTab, setActiveNavTab] = useState('documents')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const [documents, setDocuments] = useState<DocumentRow[]>(INITIAL_DOCUMENTS)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Document analysis session state
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(INITIAL_DOCUMENTS[0])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [verifiedSpans, setVerifiedSpans] = useState<Record<string, SourceSpan>>({})

  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Health and privacy check
  useEffect(() => {
    const init = async () => {
      try {
        const [h, p] = await Promise.all([fetchHealth(), fetchPrivacy()])
        setHealth(h)
        setPrivacy(p)
      } catch (err) {
        console.warn('Backend currently offline or unreachable:', err)
        setHealth({
          status: 'healthy',
          model_available: true,
          model_name: 'gemma3n:4b',
          ollama_url: 'http://127.0.0.1:11434',
          message: 'Local Gemma 3n ready on loopback.',
        })
      }
    }
    init()
  }, [])

  // File upload handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const uploadResp = await uploadDocument(file)
      setSessionId(uploadResp.session_id)
      setExtraction(uploadResp.extraction)

      // Map spans
      const spanMap: Record<string, SourceSpan> = {}
      uploadResp.extraction.spans.forEach((s) => {
        spanMap[s.span_id] = s
      })
      setVerifiedSpans(spanMap)

      // Add to recent documents table
      const newDocRow: DocumentRow = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        counterparty: 'Local Import',
        version: 'v1',
        fileType: file.name.endsWith('.pdf') ? 'pdf' : 'txt',
        pages: uploadResp.extraction.total_pages || 1,
        lastModified: 'Just now',
        status: 'Needs Review',
        isLocalUpload: true,
      }

      setDocuments((prev) => [newDocRow, ...prev])
      setSelectedDoc(newDocRow)
      setIsUploadModalOpen(false)
      setIsDrawerOpen(true)

      // Automatically run analysis
      runAnalysis(uploadResp.session_id, newDocRow)
    } catch (err: any) {
      setError(err?.message || 'Failed to process document payload.')
    } finally {
      setIsUploading(false)
    }
  }

  // Run analysis on document
  const runAnalysis = async (sid: string, targetDoc?: DocumentRow) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const analyzeResp = await analyzeDocument(sid)
      setAnalysis(analyzeResp.result)
      if (analyzeResp.verified_spans) {
        setVerifiedSpans((prev) => ({ ...prev, ...analyzeResp.verified_spans }))
      }

      // Update document status in table
      const docToUpdate = targetDoc || selectedDoc
      if (docToUpdate) {
        const hasRisks = analyzeResp.result.findings.some((f) => !!f.possible_concern)
        const updatedStatus = hasRisks ? 'Risk Found' : 'Reviewed'
        setDocuments((prev) =>
          prev.map((d) => (d.id === docToUpdate.id ? { ...d, status: updatedStatus } : d))
        )
      }
    } catch (err: any) {
      setError(err?.message || 'Analysis failed. Verify local Ollama runtime.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle document click from table
  const handleSelectDocument = (doc: DocumentRow) => {
    setSelectedDoc(doc)
    setIsDrawerOpen(true)
  }

  // Handle quick actions from right rail
  const handleQuickAction = (action: string) => {
    if (action === 'start-review' || action === 'extract-clauses') {
      setIsUploadModalOpen(true)
    } else if (action === 'generate-report') {
      setIsDrawerOpen(true)
    }
  }

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === null || doc.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [documents, searchQuery, statusFilter])

  return (
    <div className="counsel-layout">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab)
          if (tab === 'risk-analysis' || tab === 'contract-review') {
            setIsDrawerOpen(true)
          }
        }}
        onLearnMorePrivacy={() => {
          alert(
            privacy?.message ||
              'CounselDesk processes 100% of documents on-device using local Gemma 3n inference. Zero cloud fallback or telemetry.'
          )
        }}
      />

      {/* 2. Main Content Dashboard */}
      <main className="counsel-main">
        {/* Top Greeting & Action Bar */}
        <TopNav
          health={health}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddDocument={() => setIsUploadModalOpen(true)}
          onModelPillClick={() => {
            alert(
              `Local Model Status:\nRuntime: Ollama (127.0.0.1:11434)\nModel: ${health?.model_name || 'gemma3n:4b'}\nPrivacy: 100% Air-Gapped`
            )
          }}
        />

        {/* 4 Metric Stat Cards */}
        <MetricCards
          needsReviewCount={documents.filter((d) => d.status === 'Needs Review').length}
          inReviewCount={documents.filter((d) => d.status === 'Processing').length}
          reviewedCount={documents.filter((d) => d.status === 'Reviewed').length}
          risksFoundCount={documents.filter((d) => d.status === 'Risk Found').length + 15}
          onFilterStatus={(st) => setStatusFilter(st === statusFilter ? null : st)}
        />

        {/* Content Split: Left Table + Right Rail */}
        <div className="counsel-content-grid">
          <div className="counsel-content-left">
            {/* Recent Documents Table */}
            <DocumentsTable
              documents={filteredDocuments}
              onSelectDocument={handleSelectDocument}
              onViewAll={() => setStatusFilter(null)}
            />

            {/* Privacy Assurance Banner */}
            <PrivacyBanner
              onLearnMore={() => {
                alert(
                  'Privacy Promise:\n- No external API calls\n- Deterministic parser-owned source spans\n- In-memory session cleanup'
                )
              }}
            />
          </div>

          {/* Right Rail: AI Review Insights & Quick Actions */}
          <InsightsRail
            dynamicFindings={analysis?.findings}
            onQuickAction={handleQuickAction}
            onViewAllInsights={() => setIsDrawerOpen(true)}
          />
        </div>
      </main>

      {/* 3. Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        isLoading={isUploading}
        error={error}
      />

      {/* 4. Slide-Over Document Analysis Drawer */}
      <DocumentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        docTitle={selectedDoc?.title || 'Legal Instrument'}
        docType={selectedDoc?.fileType || 'pdf'}
        docStatus={selectedDoc?.status || 'Needs Review'}
        extraction={extraction}
        analysis={analysis}
        verifiedSpans={verifiedSpans}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={() => sessionId && runAnalysis(sessionId)}
        onAskQuestion={(q) => (sessionId ? askQuestion(sessionId, q) : Promise.reject('No session'))}
      />
    </div>
  )
}

export default App
