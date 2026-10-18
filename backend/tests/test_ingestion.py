"""Unit tests for the ingestion module.

Uses synthetic test fixtures only — no real private documents.
"""

from __future__ import annotations

import io
import pytest

from app.ingestion import (
    IngestionError,
    extract_document,
    extract_pdf,
    extract_txt,
    validate_file,
)


# ── Fixtures ──────────────────────────────────────────────────────────────


SAMPLE_TXT = """\
RENTAL AGREEMENT

This agreement is between the landlord ("Owner") and the tenant ("Renter").

1. TERM
The lease begins on January 1, 2025 and ends on December 31, 2025.
The tenant must provide 30 days written notice before vacating.

2. RENT
Monthly rent is $1,500, due on the 1st of each month.
Late payments incur a fee of $50.

3. SECURITY DEPOSIT
A security deposit of $3,000 is required.
The deposit will be returned within 30 days of lease termination,
minus any deductions for damages.

4. TERMINATION
Either party may terminate with 60 days written notice.
Early termination by tenant requires payment of 2 months rent.
"""

SAMPLE_TXT_BYTES = SAMPLE_TXT.encode("utf-8")


def _make_simple_pdf() -> bytes:
    """Create a minimal valid PDF with fitz for testing."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "RENTAL AGREEMENT\n\nThis is a test document.")
    page2 = doc.new_page()
    page2.insert_text((72, 72), "Section 2: Obligations\n\nTenant must pay rent monthly.")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ── validate_file tests ──────────────────────────────────────────────────


class TestValidateFile:
    def test_valid_txt(self):
        validate_file("contract.txt", 100, b"Hello")

    def test_valid_pdf(self):
        validate_file("contract.pdf", 100, b"%PDF-1.4")

    def test_unsupported_extension(self):
        with pytest.raises(IngestionError, match="Unsupported file type"):
            validate_file("image.jpg", 100, b"\xff\xd8")

    def test_empty_file(self):
        with pytest.raises(IngestionError, match="empty"):
            validate_file("doc.txt", 0, b"")

    def test_oversized_file(self):
        with pytest.raises(IngestionError, match="maximum allowed size"):
            validate_file("big.pdf", 30 * 1024 * 1024, b"%PDF-1.4")

    def test_invalid_pdf_magic(self):
        with pytest.raises(IngestionError, match="does not appear to be a valid PDF"):
            validate_file("fake.pdf", 100, b"NOT_PDF")

    def test_docx_rejected(self):
        with pytest.raises(IngestionError, match="Unsupported file type"):
            validate_file("document.docx", 100, b"PK\x03\x04")


# ── TXT extraction tests ─────────────────────────────────────────────────


class TestTxtExtraction:
    def test_basic_extraction(self):
        result = extract_txt(SAMPLE_TXT_BYTES, "contract.txt")
        assert result.file_type == "txt"
        assert result.filename == "contract.txt"
        assert result.total_chars > 0
        assert len(result.spans) > 0
        assert result.total_pages is None

    def test_spans_have_valid_ids(self):
        result = extract_txt(SAMPLE_TXT_BYTES, "contract.txt")
        for span in result.spans:
            assert span.span_id
            assert span.text.strip()

    def test_spans_have_line_numbers(self):
        result = extract_txt(SAMPLE_TXT_BYTES, "contract.txt")
        for span in result.spans:
            assert span.line_start is not None
            assert span.line_end is not None
            assert span.line_start <= span.line_end

    def test_empty_txt_rejected(self):
        with pytest.raises(IngestionError, match="empty"):
            extract_txt(b"   \n  \n  ", "empty.txt")

    def test_whitespace_only_rejected(self):
        with pytest.raises(IngestionError, match="empty"):
            extract_txt(b"   ", "blank.txt")

    def test_full_text_preserved(self):
        result = extract_txt(SAMPLE_TXT_BYTES, "contract.txt")
        assert "RENTAL AGREEMENT" in result.full_text
        assert "security deposit" in result.full_text.lower()


# ── PDF extraction tests ─────────────────────────────────────────────────


class TestPdfExtraction:
    def test_basic_extraction(self):
        pdf_bytes = _make_simple_pdf()
        result = extract_pdf(pdf_bytes, "test.pdf")
        assert result.file_type == "pdf"
        assert result.total_pages == 2
        assert len(result.spans) > 0

    def test_spans_have_page_numbers(self):
        pdf_bytes = _make_simple_pdf()
        result = extract_pdf(pdf_bytes, "test.pdf")
        pages_seen = set()
        for span in result.spans:
            assert span.page is not None
            assert span.page >= 1
            pages_seen.add(span.page)
        assert len(pages_seen) >= 1

    def test_corrupted_pdf_rejected(self):
        with pytest.raises(IngestionError, match="Failed to open|corrupted|encrypted"):
            extract_pdf(b"NOT A PDF AT ALL", "bad.pdf")


# ── extract_document dispatch tests ──────────────────────────────────────


class TestExtractDocument:
    def test_txt_dispatch(self):
        bio = io.BytesIO(SAMPLE_TXT_BYTES)
        result = extract_document(bio, "contract.txt")
        assert result.file_type == "txt"

    def test_pdf_dispatch(self):
        pdf_bytes = _make_simple_pdf()
        bio = io.BytesIO(pdf_bytes)
        result = extract_document(bio, "contract.pdf")
        assert result.file_type == "pdf"

    def test_unsupported_file_rejected(self):
        bio = io.BytesIO(b"some data")
        with pytest.raises(IngestionError, match="Unsupported"):
            extract_document(bio, "image.png")
