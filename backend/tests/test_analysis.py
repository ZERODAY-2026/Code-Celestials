"""Tests for the analysis engine — citation verification and validation."""

from __future__ import annotations


from app.schemas import (
    AnalysisResult,
    Confidence,
    DocumentExtraction,
    FindingCategory,
    SourceSpan,
)
from app.analysis import (
    _build_span_index,
    _validate_finding,
    _validate_analysis_result,
    create_session,
    delete_session,
    get_session,
)


# ── Fixtures ──────────────────────────────────────────────────────────────


def _make_extraction() -> DocumentExtraction:
    return DocumentExtraction(
        filename="test.txt",
        file_type="txt",
        total_pages=None,
        total_chars=200,
        spans=[
            SourceSpan(
                span_id="abc-pN-c0",
                page=None,
                line_start=1,
                line_end=3,
                char_offset_start=0,
                char_offset_end=100,
                text="Tenant must pay rent of $1500 monthly.",
            ),
            SourceSpan(
                span_id="abc-pN-c1",
                page=None,
                line_start=5,
                line_end=7,
                char_offset_start=101,
                char_offset_end=200,
                text="Late payment incurs a $50 penalty fee.",
            ),
        ],
        full_text="Tenant must pay rent of $1500 monthly.\n\nLate payment incurs a $50 penalty fee.",
    )


# ── Session management tests ─────────────────────────────────────────────


class TestSessionManagement:
    def test_create_and_get_session(self):
        extraction = _make_extraction()
        sid = create_session(extraction)
        assert get_session(sid) is not None
        assert get_session(sid).filename == "test.txt"
        # Cleanup
        delete_session(sid)

    def test_delete_session(self):
        extraction = _make_extraction()
        sid = create_session(extraction)
        assert delete_session(sid) is True
        assert get_session(sid) is None

    def test_delete_nonexistent_session(self):
        assert delete_session("nonexistent-id") is False

    def test_get_nonexistent_session(self):
        assert get_session("nonexistent-id") is None


# ── Citation validation tests ─────────────────────────────────────────────


class TestCitationValidation:
    def setup_method(self):
        self.extraction = _make_extraction()
        self.span_index = _build_span_index(self.extraction)

    def test_valid_finding_with_existing_spans(self):
        finding_data = {
            "category": "obligation",
            "title": "Monthly Rent",
            "explicit_text": "Tenant must pay rent of $1500 monthly.",
            "plain_language_explanation": "You need to pay $1500 each month.",
            "possible_concern": "High rent amount",
            "uncertainty": None,
            "source_span_ids": ["abc-pN-c0"],
            "confidence": "high",
            "suggested_questions": ["Can rent be negotiated?"],
        }

        result = _validate_finding(finding_data, self.span_index)
        assert result is not None
        assert result.category == FindingCategory.OBLIGATION
        assert result.source_span_ids == ["abc-pN-c0"]
        assert result.confidence == Confidence.HIGH

    def test_finding_with_nonexistent_spans_downgraded(self):
        finding_data = {
            "category": "penalty",
            "title": "Made Up Penalty",
            "explicit_text": "This text does not exist in the document.",
            "plain_language_explanation": "Fabricated finding.",
            "source_span_ids": ["FAKE-SPAN-ID"],
            "confidence": "high",
        }

        result = _validate_finding(finding_data, self.span_index)
        assert result is not None
        # No verified spans → confidence downgraded
        assert result.confidence == Confidence.LOW
        assert len(result.source_span_ids) == 0

    def test_finding_with_mixed_valid_invalid_spans(self):
        finding_data = {
            "category": "fee",
            "title": "Late Fee",
            "explicit_text": "Late payment penalty",
            "plain_language_explanation": "There is a late fee.",
            "source_span_ids": ["abc-pN-c1", "FAKE-ID"],
            "confidence": "medium",
        }

        result = _validate_finding(finding_data, self.span_index)
        assert result is not None
        # Only valid span kept
        assert result.source_span_ids == ["abc-pN-c1"]

    def test_explicit_text_from_verified_span(self):
        finding_data = {
            "category": "obligation",
            "title": "Rent",
            "explicit_text": "Model fabricated this text",
            "plain_language_explanation": "Pay rent.",
            "source_span_ids": ["abc-pN-c0"],
            "confidence": "high",
        }

        result = _validate_finding(finding_data, self.span_index)
        assert result is not None
        # explicit_text should come from the stored span, not model output
        assert "Tenant must pay rent" in result.explicit_text

    def test_unknown_category_defaults_to_other(self):
        finding_data = {
            "category": "made_up_category",
            "title": "Something",
            "explicit_text": "text",
            "plain_language_explanation": "explanation",
            "source_span_ids": [],
            "confidence": "medium",
        }

        result = _validate_finding(finding_data, self.span_index)
        assert result is not None
        assert result.category == FindingCategory.OTHER


class TestAnalysisResultValidation:
    def setup_method(self):
        self.extraction = _make_extraction()
        self.span_index = _build_span_index(self.extraction)

    def test_validate_full_result(self):
        raw = {
            "document_summary": "A rental agreement.",
            "findings": [
                {
                    "category": "obligation",
                    "title": "Rent",
                    "explicit_text": "pay rent",
                    "plain_language_explanation": "You pay rent.",
                    "source_span_ids": ["abc-pN-c0"],
                    "confidence": "high",
                }
            ],
            "document_silence": ["Insurance requirements not mentioned"],
            "escalation_recommended": True,
            "escalation_reason": "Consult a lawyer.",
        }

        result = _validate_analysis_result(raw, self.span_index)
        assert isinstance(result, AnalysisResult)
        assert len(result.findings) == 1
        assert result.document_summary == "A rental agreement."
        assert "Insurance" in result.document_silence[0]

    def test_empty_findings_handled(self):
        raw = {
            "document_summary": "Empty analysis.",
            "findings": [],
        }
        result = _validate_analysis_result(raw, self.span_index)
        assert len(result.findings) == 0
        assert result.escalation_recommended is True
