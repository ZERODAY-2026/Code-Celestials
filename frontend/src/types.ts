/**
 * PS2 Legal Triage Agent - TypeScript definitions
 */

export type FindingCategory =
  | 'obligation'
  | 'right'
  | 'deadline'
  | 'fee'
  | 'penalty'
  | 'termination'
  | 'renewal'
  | 'liability'
  | 'confidentiality'
  | 'ambiguity'
  | 'other'

export type Confidence = 'low' | 'medium' | 'high'

export interface SourceSpan {
  span_id: string
  page?: number | null
  line_start?: number | null
  line_end?: number | null
  char_offset_start: number
  char_offset_end: number
  text: string
}

export interface DocumentExtraction {
  filename: string
  file_type: 'pdf' | 'txt'
  total_pages?: number | null
  total_chars: number
  spans: SourceSpan[]
  full_text: string
  warnings: string[]
}

export interface Finding {
  category: FindingCategory
  title: string
  explicit_text: string
  plain_language_explanation: string
  possible_concern?: string | null
  uncertainty?: string | null
  source_span_ids: string[]
  confidence: Confidence
  suggested_questions: string[]
}

export interface AnalysisResult {
  document_summary: string
  findings: Finding[]
  document_silence: string[]
  escalation_recommended: boolean
  escalation_reason?: string | null
  disclaimer: string
}

export interface UploadResponse {
  session_id: string
  extraction: DocumentExtraction
}

export interface AnalyzeResponse {
  session_id: string
  result: AnalysisResult
  verified_spans: Record<string, SourceSpan>
}

export interface QuestionResponse {
  session_id: string
  answer: string
  source_span_ids: string[]
  verified_spans: Record<string, SourceSpan>
  uncertainty?: string | null
  disclaimer: string
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'error'
  model_available: boolean
  model_name: string
  ollama_url: string
  message: string
}

export interface PrivacyStatus {
  model_local: boolean
  ollama_bound_to_loopback: boolean
  no_cloud_fallback: boolean
  session_cleanup_available: boolean
  message: string
}
