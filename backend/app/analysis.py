"""Analysis engine — orchestrates extraction, retrieval, inference, and validation.

Verifies every citation against parser-produced source spans.
Handles document silence, ambiguity, and safe escalation.
"""

from __future__ import annotations

import logging
import uuid
from typing import Optional

from app.schemas import (
    AnalysisResult,
    AnalyzeResponse,
    Confidence,
    DocumentExtraction,
    Finding,
    FindingCategory,
    QuestionResponse,
    SourceSpan,
)
from app.llm import (
    ModelOutputError,
    ModelUnavailableError,
    generate_analysis,
    generate_answer,
)

logger = logging.getLogger(__name__)

# In-memory session store (no persistence by default)
_sessions: dict[str, DocumentExtraction] = {}


def create_session(extraction: DocumentExtraction) -> str:
    """Store an extraction result in a new session and return the session ID."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = extraction
    logger.info("Session created: %s", session_id)
    return session_id


def get_session(session_id: str) -> Optional[DocumentExtraction]:
    """Retrieve a session's extraction data."""
    return _sessions.get(session_id)


def delete_session(session_id: str) -> bool:
    """Delete a session and its data. Returns True if the session existed."""
    if session_id in _sessions:
        del _sessions[session_id]
        logger.info("Session deleted: %s", session_id)
        return True
    return False


def list_sessions() -> list[str]:
    """List active session IDs (for debugging, no content exposed)."""
    return list(_sessions.keys())


def _build_span_index(extraction: DocumentExtraction) -> dict[str, SourceSpan]:
    """Build a lookup from span_id to SourceSpan."""
    return {span.span_id: span for span in extraction.spans}


def _retrieve_relevant_spans(
    extraction: DocumentExtraction,
    query: str | None = None,
    max_spans: int = 50,
) -> list[SourceSpan]:
    """Retrieve relevant source spans for analysis or question answering.

    If query is provided, ranks spans by keyword overlap.
    Otherwise, returns spans in document order up to max_spans.
    """
    if not query or not query.strip():
        return extraction.spans[:max_spans]

    # Keyword overlap scoring
    import re

    stopwords = {
        "what", "when", "where", "which", "who", "whom", "whose", "why",
        "how", "is", "are", "was", "were", "be", "been", "being", "have",
        "has", "had", "do", "does", "did", "the", "a", "an", "and", "or",
        "but", "if", "then", "else", "for", "with", "about", "against",
        "between", "into", "through", "during", "before", "after", "above",
        "below", "to", "from", "up", "down", "in", "out", "on", "off",
        "over", "under", "again", "further", "then", "once", "any", "all",
    }
    tokens = [
        t for t in re.findall(r"\b\w{3,}\b", query.lower())
        if t not in stopwords
    ]

    if not tokens:
        return extraction.spans[:max_spans]

    def score_span(span: SourceSpan) -> int:
        text_lower = span.text.lower()
        score = 0
        for token in tokens:
            if token in text_lower:
                score += text_lower.count(token)
        return score

    scored_spans = [(score_span(s), idx, s) for idx, s in enumerate(extraction.spans)]
    # Keep spans with score > 0, sorted by score desc, then original document order
    matched = [s for score, _, s in sorted(scored_spans, key=lambda x: (-x[0], x[1])) if score > 0]

    if matched:
        # Include top matches up to max_spans
        return matched[:max_spans]

    # Fallback to initial spans if no keyword matches
    return extraction.spans[:max_spans]


def _validate_finding(finding_data: dict, span_index: dict[str, SourceSpan]) -> Optional[Finding]:
    """Validate a single finding from model output against the span index.

    Returns a validated Finding or None if the finding cannot be verified.
    """
    try:
        # Validate category
        category_str = finding_data.get("category", "other")
        try:
            category = FindingCategory(category_str)
        except ValueError:
            category = FindingCategory.OTHER

        # Validate confidence
        confidence_str = finding_data.get("confidence", "medium")
        try:
            confidence = Confidence(confidence_str)
        except ValueError:
            confidence = Confidence.MEDIUM

        # Validate source span IDs — only keep IDs that exist in the parser index
        raw_span_ids = finding_data.get("source_span_ids", [])
        verified_span_ids = [sid for sid in raw_span_ids if sid in span_index]

        if not verified_span_ids:
            # Finding has no verified source — downgrade confidence
            logger.info("Finding has no verified source spans, marking as low confidence")
            confidence = Confidence.LOW

        # Build the explicit_text from verified spans, not from model output
        if verified_span_ids:
            explicit_text = " [...] ".join(
                span_index[sid].text[:200] for sid in verified_span_ids[:3]
            )
        else:
            explicit_text = finding_data.get("explicit_text", "[No verified source]")

        return Finding(
            category=category,
            title=finding_data.get("title", "Untitled Finding"),
            explicit_text=explicit_text,
            plain_language_explanation=finding_data.get(
                "plain_language_explanation", ""
            ),
            possible_concern=finding_data.get("possible_concern"),
            uncertainty=finding_data.get("uncertainty"),
            source_span_ids=verified_span_ids,
            confidence=confidence,
            suggested_questions=finding_data.get("suggested_questions", []),
        )
    except Exception:
        logger.info("Failed to validate a finding from model output")
        return None


def _validate_analysis_result(
    raw_result: dict,
    span_index: dict[str, SourceSpan],
) -> AnalysisResult:
    """Validate the full model output, verifying all citations."""
    # Validate findings
    raw_findings = raw_result.get("findings", [])
    validated_findings: list[Finding] = []

    for finding_data in raw_findings:
        validated = _validate_finding(finding_data, span_index)
        if validated is not None:
            validated_findings.append(validated)

    return AnalysisResult(
        document_summary=raw_result.get("document_summary", "Summary not available."),
        findings=validated_findings,
        document_silence=raw_result.get("document_silence", []),
        escalation_recommended=raw_result.get("escalation_recommended", True),
        escalation_reason=raw_result.get(
            "escalation_reason",
            "This is an automated preliminary analysis. "
            "Consult a qualified legal professional for definitive advice.",
        ),
    )


async def analyze_document(session_id: str) -> AnalyzeResponse:
    """Run full analysis on a session's document.

    Steps:
    1. Retrieve relevant source spans
    2. Send to local Gemma model
    3. Validate output and verify citations
    4. Return grounded results with verified spans
    """
    extraction = get_session(session_id)
    if extraction is None:
        raise ValueError(f"Session '{session_id}' not found.")

    span_index = _build_span_index(extraction)

    # Step 1: Retrieve relevant spans
    relevant_spans = _retrieve_relevant_spans(extraction)

    if not relevant_spans:
        return AnalyzeResponse(
            session_id=session_id,
            result=AnalysisResult(
                document_summary="No text could be extracted from the document.",
                findings=[],
                document_silence=["The document could not be read."],
                escalation_recommended=True,
                escalation_reason="No content was extracted for analysis.",
            ),
            verified_spans={},
        )

    # Step 2: Send to local model
    try:
        raw_result = await generate_analysis(relevant_spans)
    except ModelUnavailableError as e:
        raise RuntimeError(str(e))
    except ModelOutputError:
        # Retry with a simpler prompt is possible, but for now raise
        raise RuntimeError(
            "The local model returned output that could not be parsed. "
            "This may indicate a model compatibility issue."
        )

    # Step 3: Validate and verify citations
    result = _validate_analysis_result(raw_result, span_index)

    # Step 4: Collect verified spans referenced by findings
    verified_spans: dict[str, SourceSpan] = {}
    for finding in result.findings:
        for sid in finding.source_span_ids:
            if sid in span_index:
                verified_spans[sid] = span_index[sid]

    return AnalyzeResponse(
        session_id=session_id,
        result=result,
        verified_spans=verified_spans,
    )


async def answer_question(session_id: str, question: str) -> QuestionResponse:
    """Answer a question about the document using retrieved evidence."""
    extraction = get_session(session_id)
    if extraction is None:
        raise ValueError(f"Session '{session_id}' not found.")

    span_index = _build_span_index(extraction)
    relevant_spans = _retrieve_relevant_spans(extraction, query=question, max_spans=20)

    if not relevant_spans:
        return QuestionResponse(
            session_id=session_id,
            answer="No relevant text was found in the document to answer this question.",
            uncertainty="The document may not contain information related to this question.",
        )

    try:
        raw_answer = await generate_answer(question, relevant_spans)
    except ModelUnavailableError as e:
        raise RuntimeError(str(e))
    except ModelOutputError:
        raise RuntimeError(
            "The local model returned output that could not be parsed."
        )

    # Validate cited spans
    raw_span_ids = raw_answer.get("source_span_ids", [])
    verified_ids = [sid for sid in raw_span_ids if sid in span_index]
    verified_spans = {sid: span_index[sid] for sid in verified_ids}

    return QuestionResponse(
        session_id=session_id,
        answer=raw_answer.get("answer", "Unable to generate an answer."),
        source_span_ids=verified_ids,
        verified_spans=verified_spans,
        uncertainty=raw_answer.get("uncertainty"),
    )
