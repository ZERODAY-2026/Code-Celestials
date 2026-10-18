"""Pydantic schemas for document analysis — PS2 Legal Triage Agent.

These schemas define the structured output for document analysis,
including source spans, findings, and citations.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Source span models (parser-owned) ──────────────────────────────────────


class SourceSpan(BaseModel):
    """An immutable text fragment created by the parser.

    The parser assigns ``span_id`` at extraction time.
    Evidence shown to the user always comes from the stored ``text``, never
    from model-generated quotations.
    """

    span_id: str = Field(description="Unique identifier for this span, e.g. 'pdf-p3-c42'")
    page: Optional[int] = Field(None, description="1-based page number (PDF) or None (TXT)")
    line_start: Optional[int] = Field(None, description="Starting line number")
    line_end: Optional[int] = Field(None, description="Ending line number")
    char_offset_start: int = Field(description="Character offset from the start of the document")
    char_offset_end: int = Field(description="Character offset end")
    text: str = Field(description="Exact extracted text")


class DocumentExtraction(BaseModel):
    """Result of local document extraction."""

    filename: str
    file_type: str  # "pdf" | "txt"
    total_pages: Optional[int] = None
    total_chars: int
    spans: list[SourceSpan]
    full_text: str = Field(description="Full concatenated text for preview")
    warnings: list[str] = Field(default_factory=list)


# ── Finding / analysis models ─────────────────────────────────────────────


class FindingCategory(str, Enum):
    OBLIGATION = "obligation"
    RIGHT = "right"
    DEADLINE = "deadline"
    FEE = "fee"
    PENALTY = "penalty"
    TERMINATION = "termination"
    RENEWAL = "renewal"
    LIABILITY = "liability"
    CONFIDENTIALITY = "confidentiality"
    AMBIGUITY = "ambiguity"
    OTHER = "other"


class Confidence(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Finding(BaseModel):
    """A single analysis finding, grounded in source evidence."""

    category: FindingCategory
    title: str
    explicit_text: str = Field(description="Exact text from the document")
    plain_language_explanation: str = Field(description="Plain-language explanation")
    possible_concern: Optional[str] = Field(None, description="Potential risk (informational only)")
    uncertainty: Optional[str] = Field(None, description="Ambiguity or missing context")
    source_span_ids: list[str] = Field(description="IDs of supporting source spans")
    confidence: Confidence = Confidence.MEDIUM
    suggested_questions: list[str] = Field(
        default_factory=list,
        description="Questions to ask a qualified legal professional",
    )


class AnalysisResult(BaseModel):
    """Complete analysis result for a document."""

    document_summary: str
    findings: list[Finding]
    document_silence: list[str] = Field(
        default_factory=list,
        description="Questions not answered by the document",
    )
    escalation_recommended: bool = True
    escalation_reason: Optional[str] = Field(
        default="This is an automated preliminary analysis. "
        "Consult a qualified legal professional for definitive advice.",
    )
    disclaimer: str = Field(
        default="⚠️ This analysis is for informational purposes only and does not "
        "constitute legal advice. It should not be relied upon as a substitute for "
        "consultation with a qualified legal professional.",
    )


# ── API request / response models ─────────────────────────────────────────


class UploadResponse(BaseModel):
    """Response after successful file upload and extraction."""

    session_id: str
    extraction: DocumentExtraction


class AnalyzeRequest(BaseModel):
    """Request to analyze an already-uploaded document."""

    session_id: str


class AnalyzeResponse(BaseModel):
    """Response containing the full analysis result with verified citations."""

    session_id: str
    result: AnalysisResult
    verified_spans: dict[str, SourceSpan] = Field(
        default_factory=dict,
        description="Map of span_id -> SourceSpan for all cited evidence",
    )


class QuestionRequest(BaseModel):
    """Request to ask a question about the loaded document."""

    session_id: str
    question: str


class QuestionResponse(BaseModel):
    """Response to a document question."""

    session_id: str
    answer: str
    source_span_ids: list[str] = Field(default_factory=list)
    verified_spans: dict[str, SourceSpan] = Field(default_factory=dict)
    uncertainty: Optional[str] = None
    disclaimer: str = Field(
        default="⚠️ This answer is for informational purposes only and is not legal advice.",
    )


class HealthResponse(BaseModel):
    """Health check response including model status."""

    status: str  # "healthy" | "degraded" | "error"
    model_available: bool
    model_name: str
    ollama_url: str
    message: str


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    detail: Optional[str] = None


class PrivacyStatus(BaseModel):
    """Runtime privacy status."""

    model_local: bool
    ollama_bound_to_loopback: bool
    no_cloud_fallback: bool
    session_cleanup_available: bool
    message: str
