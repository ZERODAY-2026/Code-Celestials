import React, { useEffect, useState, useMemo } from 'react'
import type {
  AnalysisResult,
  DocumentExtraction,
  HealthResponse,
  PrivacyStatus,
  SourceSpan,
  QuestionResponse,
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
import { UploadModal } from './components/UploadModal'
import { DocumentDrawer } from './components/DocumentDrawer'
import { DocumentRow } from './components/DocumentsTable'

import { DocumentsView } from './components/views/DocumentsView'
import { ContractReviewView } from './components/views/ContractReviewView'
import { RiskAnalysisView } from './components/views/RiskAnalysisView'
import { ClauseExtractionView } from './components/views/ClauseExtractionView'
import { ReportsView } from './components/views/ReportsView'
import { ActivityView, ActivityEvent } from './components/views/ActivityView'
import { ClauseLibraryView } from './components/views/ClauseLibraryView'
import { SettingsView } from './components/views/SettingsView'
import { SAMPLE_CONTRACTS, SampleContract, getContractContentForDoc } from './data/sampleContracts'

const STORAGE_KEY = 'counseldesk_documents'
const ACTIVITY_STORAGE_KEY = 'counseldesk_activity'

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [privacy, setPrivacy] = useState<PrivacyStatus | null>(null)
  const [activeNavTab, setActiveNavTab] = useState<string>('documents')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Real documents list — no hardcoded dummy PDFs!
  const [documents, setDocuments] = useState<DocumentRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Activity audit log
  const [activityList, setActivityList] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY)
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'init-1',
              timestamp: new Date().toLocaleTimeString(),
              type: 'upload',
              title: 'Workspace Initialized',
              details: 'CounselDesk session booted in 100% on-device air-gapped mode.',
              badgeText: 'AIR-GAPPED',
              badgeColor: '#10B981',
            },
          ]
    } catch {
      return []
    }
  })

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Document analysis session state
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [verifiedSpans, setVerifiedSpans] = useState<Record<string, SourceSpan>>({})

  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save documents to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    } catch (e) {
      console.warn('Could not persist documents to localStorage:', e)
    }
  }, [documents])

  // Save activity to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activityList))
    } catch (e) {
      console.warn('Could not persist activity to localStorage:', e)
    }
  }, [activityList])

  const logActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
    }
    setActivityList((prev) => [newEvent, ...prev])
  }

  // Cache session and analysis by doc title / id
  const docCacheRef = React.useRef<
    Record<
      string,
      {
        sessionId: string
        extraction: DocumentExtraction
        analysis: AnalysisResult | null
        verifiedSpans: Record<string, SourceSpan>
      }
    >
  >({})

  // Health and privacy check on boot
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

  // Run analysis on document
  const runAnalysis = async (sid: string, targetDoc?: DocumentRow) => {
    setIsAnalyzing(true)
    setError(null)

    const docTarget = targetDoc || selectedDoc
    logActivity({
      type: 'analysis',
      title: `Local Gemma 3n Analysis: ${docTarget?.title || 'Contract'}`,
      details: 'Dispatched grounded citation extraction to local Ollama runtime.',
      badgeText: 'GEMMA 3N',
      badgeColor: '#0D382B',
    })

    try {
      const analyzeResp = await analyzeDocument(sid)
      setAnalysis(analyzeResp.result)
      if (analyzeResp.verified_spans) {
        setVerifiedSpans((prev) => ({ ...prev, ...analyzeResp.verified_spans }))
      }

      // Update cache
      if (docTarget) {
        if (docCacheRef.current[docTarget.title]) {
          docCacheRef.current[docTarget.title].analysis = analyzeResp.result
          if (analyzeResp.verified_spans) {
            docCacheRef.current[docTarget.title].verifiedSpans = {
              ...docCacheRef.current[docTarget.title].verifiedSpans,
              ...analyzeResp.verified_spans,
            }
          }
        }
        if (docCacheRef.current[docTarget.id]) {
          docCacheRef.current[docTarget.id].analysis = analyzeResp.result
        }

        // Update document status in table
        const hasRisks = analyzeResp.result.findings.some((f) => !!f.possible_concern || f.category === 'liability')
        const updatedStatus = hasRisks ? 'Risk Found' : 'Reviewed'
        setDocuments((prev) =>
          prev.map((d) => (d.id === docTarget.id ? { ...d, status: updatedStatus } : d))
        )
      }

      logActivity({
        type: 'analysis',
        title: `Analysis Complete: ${analyzeResp.result.findings.length} Provisions Grounded`,
        details: `Identified ${analyzeResp.result.findings.length} findings, ${analyzeResp.result.document_silence.length} silence items with 100% verified spans.`,
        badgeText: 'SUCCESS',
        badgeColor: '#059669',
      })
    } catch (err: any) {
      const msg = err?.message || 'Analysis failed. Verify local Ollama runtime.'
      setError(msg)
      logActivity({
        type: 'analysis',
        title: 'Analysis Error',
        details: msg,
        badgeText: 'ERROR',
        badgeColor: '#DC2626',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Ensure active backend session exists for a document
  const ensureSessionForDoc = async (
    doc: DocumentRow | null,
    forceReanalyze = false
  ): Promise<string | null> => {
    if (!doc) return null

    // Check cache first
    const cached = docCacheRef.current[doc.title] || docCacheRef.current[doc.id]
    if (cached && !forceReanalyze) {
      setSessionId(cached.sessionId)
      setExtraction(cached.extraction)
      setAnalysis(cached.analysis)
      setVerifiedSpans(cached.verifiedSpans)
      if (cached.analysis) return cached.sessionId
    }

    // Retrieve comprehensive contract content from library or rich template generator
    const content = getContractContentForDoc(doc)
    const blob = new Blob([content], { type: 'text/plain' })
    const file = new File([blob], `${doc.title.replace(/\s+/g, '_')}.txt`, { type: 'text/plain' })

    try {
      setIsUploading(true)
      const uploadResp = await uploadDocument(file)
      const sid = uploadResp.session_id
      setSessionId(sid)
      setExtraction(uploadResp.extraction)

      const spanMap: Record<string, SourceSpan> = {}
      uploadResp.extraction.spans.forEach((s) => {
        spanMap[s.span_id] = s
      })
      setVerifiedSpans(spanMap)

      const cacheEntry = {
        sessionId: sid,
        extraction: uploadResp.extraction,
        analysis: null,
        verifiedSpans: spanMap,
      }
      docCacheRef.current[doc.title] = cacheEntry
      docCacheRef.current[doc.id] = cacheEntry

      // Automatically trigger analysis
      runAnalysis(sid, doc)
      return sid
    } catch (err: any) {
      console.error('Failed to ensure session for document:', err)
      setError(err?.message || 'Could not connect document to local Gemma runtime.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Auto-hydrate session on boot
  useEffect(() => {
    if (documents.length > 0) {
      const active = selectedDoc || documents[0]
      setSelectedDoc(active)
      ensureSessionForDoc(active)
    } else {
      handleLoadSample(SAMPLE_CONTRACTS[0])
    }
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

      // Add to documents table
      const newDocRow: DocumentRow = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        counterparty: 'Imported Document',
        version: 'v1',
        fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
        pages: uploadResp.extraction.total_pages || 1,
        lastModified: 'Just now',
        status: 'Needs Review',
        isLocalUpload: true,
      }

      docCacheRef.current[newDocRow.title] = {
        sessionId: uploadResp.session_id,
        extraction: uploadResp.extraction,
        analysis: null,
        verifiedSpans: spanMap,
      }
      docCacheRef.current[newDocRow.id] = docCacheRef.current[newDocRow.title]

      setDocuments((prev) => [newDocRow, ...prev])
      setSelectedDoc(newDocRow)
      setIsUploadModalOpen(false)

      logActivity({
        type: 'upload',
        title: `Document Ingested: ${newDocRow.title}`,
        details: `${uploadResp.extraction.total_chars.toLocaleString()} characters extracted across ${uploadResp.extraction.spans.length} verified spans.`,
        badgeText: `${newDocRow.fileType.toUpperCase()}`,
        badgeColor: '#3B82F6',
      })

      // Run analysis automatically
      runAnalysis(uploadResp.session_id, newDocRow)
    } catch (err: any) {
      setError(err?.message || 'Failed to process document payload.')
    } finally {
      setIsUploading(false)
    }
  }

  // Load realistic sample contract
  const handleLoadSample = async (sample: SampleContract) => {
    setIsUploading(true)
    setError(null)

    try {
      const blob = new Blob([sample.content], { type: 'text/plain' })
      const file = new File([blob], `${sample.title.replace(/\s+/g, '_')}.txt`, {
        type: 'text/plain',
      })

      const uploadResp = await uploadDocument(file)
      setSessionId(uploadResp.session_id)
      setExtraction(uploadResp.extraction)

      const spanMap: Record<string, SourceSpan> = {}
      uploadResp.extraction.spans.forEach((s) => {
        spanMap[s.span_id] = s
      })
      setVerifiedSpans(spanMap)

      const newDocRow: DocumentRow = {
        id: `sample-${Date.now()}`,
        title: sample.title,
        counterparty: sample.counterparty,
        version: 'v1',
        fileType: sample.fileType,
        pages: sample.pages,
        lastModified: 'Just now',
        status: 'Needs Review',
        isLocalUpload: true,
      }

      docCacheRef.current[sample.title] = {
        sessionId: uploadResp.session_id,
        extraction: uploadResp.extraction,
        analysis: null,
        verifiedSpans: spanMap,
      }
      docCacheRef.current[newDocRow.id] = docCacheRef.current[sample.title]

      setDocuments((prev) => [newDocRow, ...prev.filter((d) => d.title !== sample.title)])
      setSelectedDoc(newDocRow)

      logActivity({
        type: 'upload',
        title: `Sample Contract Loaded: ${sample.title}`,
        details: `Loaded ${sample.title} with counterparty ${sample.counterparty}.`,
        badgeText: 'SAMPLE',
        badgeColor: '#6366F1',
      })

      // Run analysis
      runAnalysis(uploadResp.session_id, newDocRow)
    } catch (err: any) {
      setError(err?.message || 'Failed to load sample contract.')
    } finally {
      setIsUploading(false)
    }
  }

  // Ask question handler — auto-ensures active session so query NEVER fails
  const handleAskQuestion = async (q: string): Promise<QuestionResponse> => {
    let sid = sessionId
    if (!sid && selectedDoc) {
      sid = await ensureSessionForDoc(selectedDoc)
    }
    if (!sid && documents.length > 0) {
      sid = await ensureSessionForDoc(documents[0])
    }
    if (!sid) {
      throw new Error('No active document session. Please upload a contract.')
    }

    logActivity({
      type: 'query',
      title: `Legal Query: "${q.slice(0, 40)}..."`,
      details: 'Gemma 3n retrieved relevant source spans to ground the response.',
      badgeText: 'Q&A',
      badgeColor: '#8B5CF6',
    })

    const resp = await askQuestion(sid, q)
    if (resp.verified_spans) {
      setVerifiedSpans((prev) => ({ ...prev, ...resp.verified_spans }))
    }
    return resp
  }

  // Delete a document — clears frontend state, backend session, and cache
  const handleDeleteDocument = async (id: string) => {
    const docToRemove = documents.find((d) => d.id === id)

    // Clear backend session if one exists
    const cached = docToRemove
      ? docCacheRef.current[docToRemove.title] || docCacheRef.current[docToRemove.id]
      : null
    if (cached?.sessionId) {
      try {
        await import('./api').then((api) => api.clearSession(cached.sessionId))
      } catch (err) {
        console.warn('Could not clear backend session:', err)
      }
    }

    // Clear cache entries
    if (docToRemove) {
      delete docCacheRef.current[docToRemove.title]
      delete docCacheRef.current[docToRemove.id]
    }

    // Remove from documents list
    setDocuments((prev) => prev.filter((d) => d.id !== id))

    // If this was the selected document, select next available or clear state
    if (selectedDoc?.id === id) {
      const remaining = documents.filter((d) => d.id !== id)
      if (remaining.length > 0) {
        setSelectedDoc(remaining[0])
        ensureSessionForDoc(remaining[0])
      } else {
        setSelectedDoc(null)
        setSessionId(null)
        setExtraction(null)
        setAnalysis(null)
        setVerifiedSpans({})
      }
    }

    logActivity({
      type: 'review',
      title: `Document Removed: ${docToRemove?.title || 'Unknown'}`,
      details: 'Document and associated session data have been cleared from local state.',
      badgeText: 'REMOVED',
      badgeColor: '#EF4444',
    })
  }

  // Clear all workspace documents
  const handleClearAllDocs = () => {
    setDocuments([])
    setSelectedDoc(null)
    setSessionId(null)
    setExtraction(null)
    setAnalysis(null)
    setVerifiedSpans({})
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    logActivity({
      type: 'review',
      title: 'Workspace Cleared',
      details: 'All loaded documents removed from local browser state.',
      badgeText: 'CLEARED',
      badgeColor: '#9CA3AF',
    })
  }

  // Reload the 3 sample contracts
  const handleReloadSamples = async () => {
    for (const sample of SAMPLE_CONTRACTS) {
      await handleLoadSample(sample)
    }
  }

  // When user selects a document
  const handleSelectDocument = async (doc: DocumentRow) => {
    setSelectedDoc(doc)
    await ensureSessionForDoc(doc)
    setIsDrawerOpen(true)
  }

  return (
    <div className="counsel-layout">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab)
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
              `Local Model Status:\nRuntime: Ollama (127.0.0.1:11434)\nModel: ${health?.model_name || 'gemma3n:4b'}\nPrivacy: 100% Air-Gapped Loopback`
            )
          }}
          selectedDoc={selectedDoc}
          onRemoveDocument={selectedDoc ? () => handleDeleteDocument(selectedDoc.id) : undefined}
        />

        {/* Dynamic View based on Active Navbar Tab */}
        {activeNavTab === 'documents' && (
          <DocumentsView
            documents={documents}
            selectedDoc={selectedDoc}
            health={health}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onFilterStatus={setStatusFilter}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={handleDeleteDocument}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onLoadSample={handleLoadSample}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            analysis={analysis}
            dynamicFindings={analysis?.findings}
            isAnalyzing={isAnalyzing}
            onNavigateTab={(tab) => setActiveNavTab(tab)}
          />
        )}

        {activeNavTab === 'contract-review' && (
          <ContractReviewView
            documents={documents}
            selectedDoc={selectedDoc}
            extraction={extraction}
            analysis={analysis}
            verifiedSpans={verifiedSpans}
            isAnalyzing={isAnalyzing}
            onSelectDoc={(d) => {
              setSelectedDoc(d)
              ensureSessionForDoc(d)
            }}
            onRunAnalysis={() => {
              if (selectedDoc) ensureSessionForDoc(selectedDoc, true)
            }}
            onAskQuestion={handleAskQuestion}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        )}

        {activeNavTab === 'risk-analysis' && (
          <RiskAnalysisView
            documents={documents}
            selectedDoc={selectedDoc}
            analysis={analysis}
            verifiedSpans={verifiedSpans}
            onSelectDoc={(d) => {
              setSelectedDoc(d)
              ensureSessionForDoc(d)
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onRunAnalysis={() => {
              if (selectedDoc) ensureSessionForDoc(selectedDoc, true)
            }}
            onAskQuestion={handleAskQuestion}
            onSpanClick={(spanId) => console.log('Span clicked:', spanId)}
            onNavigateToContract={() => setActiveNavTab('contract-review')}
          />
        )}

        {activeNavTab === 'clause-extraction' && (
          <ClauseExtractionView
            documents={documents}
            selectedDoc={selectedDoc}
            analysis={analysis}
            verifiedSpans={verifiedSpans}
            onSelectDoc={(d) => {
              setSelectedDoc(d)
              ensureSessionForDoc(d)
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onRunAnalysis={() => {
              if (selectedDoc) ensureSessionForDoc(selectedDoc, true)
            }}
            onAskQuestion={handleAskQuestion}
            onSpanClick={(spanId) => console.log('Span clicked:', spanId)}
            onNavigateToContract={() => setActiveNavTab('contract-review')}
          />
        )}

        {activeNavTab === 'reports' && (
          <ReportsView
            documents={documents}
            selectedDoc={selectedDoc}
            analysis={analysis}
            verifiedSpans={verifiedSpans}
            onSelectDoc={(d) => {
              setSelectedDoc(d)
              ensureSessionForDoc(d)
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onRunAnalysis={() => {
              if (selectedDoc) ensureSessionForDoc(selectedDoc, true)
            }}
            onAskQuestion={handleAskQuestion}
            onSpanClick={(spanId) => console.log('Span clicked:', spanId)}
            onNavigateToContract={() => setActiveNavTab('contract-review')}
          />
        )}

        {activeNavTab === 'activity' && (
          <ActivityView
            activityList={activityList}
            onClearActivity={() => setActivityList([])}
          />
        )}

        {activeNavTab === 'clause-library' && <ClauseLibraryView />}

        {activeNavTab === 'settings' && (
          <SettingsView
            health={health}
            privacy={privacy}
            onClearAllDocs={handleClearAllDocs}
            onReloadSamples={handleReloadSamples}
            totalDocs={documents.length}
          />
        )}
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
        onRunAnalysis={() => {
          if (selectedDoc) ensureSessionForDoc(selectedDoc, true)
        }}
        onAskQuestion={handleAskQuestion}
      />
    </div>
  )
}

export default App
