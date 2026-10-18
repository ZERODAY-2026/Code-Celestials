import {
  AnalyzeResponse,
  HealthResponse,
  PrivacyStatus,
  QuestionResponse,
  UploadResponse,
  DocumentExtraction,
} from './types'

// Use relative path — Vite dev server proxies /api/* to FastAPI backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`)
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchPrivacy(): Promise<PrivacyStatus> {
  const res = await fetch(`${API_BASE}/api/privacy`)
  if (!res.ok) {
    throw new Error(`Privacy status check failed: ${res.statusText}`)
  }
  return res.json()
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`)
  }

  return res.json()
}

export async function analyzeDocument(sessionId: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Analysis failed with status ${res.status}`)
  }

  return res.json()
}

export async function askQuestion(
  sessionId: string,
  question: string
): Promise<QuestionResponse> {
  const res = await fetch(`${API_BASE}/api/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Question failed with status ${res.status}`)
  }

  return res.json()
}

export async function clearSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/api/session/${sessionId}`, {
    method: 'DELETE',
  })
}

export async function fetchExtraction(sessionId: string): Promise<DocumentExtraction> {
  const res = await fetch(`${API_BASE}/api/session/${sessionId}/extraction`)
  if (!res.ok) {
    throw new Error(`Failed to load extraction: ${res.statusText}`)
  }
  return res.json()
}
