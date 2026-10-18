"""Local document ingestion — PDF and TXT extraction with source spans.

Uses PyMuPDF for PDFs and Python's standard library for TXT files.
Every extracted fragment is assigned a stable parser-owned span ID.
No document content is logged.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import BinaryIO

import fitz  # PyMuPDF

from app.schemas import DocumentExtraction, SourceSpan

logger = logging.getLogger(__name__)

# Maximum file size in bytes (default 25 MB)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".txt"}

# PDF magic bytes
PDF_MAGIC = b"%PDF"


class IngestionError(Exception):
    """Raised when a document cannot be safely ingested."""


def _make_span_id(file_hash: str, page: int | None, chunk_idx: int) -> str:
    """Generate a stable, deterministic span ID."""
    page_part = f"p{page}" if page is not None else "pN"
    return f"{file_hash[:8]}-{page_part}-c{chunk_idx}"


def validate_file(filename: str, file_size: int, content_start: bytes) -> None:
    """Validate file type, size, and basic integrity.

    Raises IngestionError with a safe, content-free message on failure.
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise IngestionError(
            f"Unsupported file type '{ext}'. Only PDF and TXT files are accepted."
        )

    if file_size == 0:
        raise IngestionError("The uploaded file is empty.")

    if file_size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        raise IngestionError(f"File exceeds the maximum allowed size of {max_mb:.0f} MB.")

    # Basic magic-byte check for PDFs
    if ext == ".pdf" and not content_start.startswith(PDF_MAGIC):
        raise IngestionError(
            "The file has a .pdf extension but does not appear to be a valid PDF."
        )


def extract_pdf(file_bytes: bytes, filename: str) -> DocumentExtraction:
    """Extract text from a PDF using PyMuPDF with page-level source spans."""
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    spans: list[SourceSpan] = []
    pages_text: list[str] = []
    warnings: list[str] = []
    global_char_offset = 0
    chunk_idx = 0

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise IngestionError("Failed to open the PDF file. It may be corrupted or encrypted.")

    if doc.is_encrypted:
        doc.close()
        raise IngestionError(
            "The PDF is encrypted. Please provide an unencrypted version."
        )

    total_pages = len(doc)

    for page_num in range(total_pages):
        page = doc.load_page(page_num)
        page_text = page.get_text("text")

        if not page_text.strip():
            warnings.append(
                f"Page {page_num + 1} contains no extractable text. "
                "It may be a scanned image requiring OCR (not currently supported)."
            )
            continue

        pages_text.append(page_text)

        # Split page text into paragraphs for finer-grained spans
        paragraphs = _split_into_paragraphs(page_text)
        current_search_idx = 0
        for para in paragraphs:
            if not para.strip():
                continue
            idx = page_text.find(para, current_search_idx)
            if idx == -1:
                idx = current_search_idx
            para_start = global_char_offset + idx
            current_search_idx = idx + len(para)
            span = SourceSpan(
                span_id=_make_span_id(file_hash, page_num + 1, chunk_idx),
                page=page_num + 1,
                line_start=None,
                line_end=None,
                char_offset_start=para_start,
                char_offset_end=para_start + len(para),
                text=para.strip(),
            )
            spans.append(span)
            chunk_idx += 1

        # Account for page_text length plus newline separator in full_text
        global_char_offset += len(page_text) + 1

    doc.close()

    full_text = "\n".join(pages_text)

    if not full_text.strip():
        raise IngestionError(
            "No text could be extracted from the PDF. "
            "The document may consist entirely of scanned images."
        )

    return DocumentExtraction(
        filename=filename,
        file_type="pdf",
        total_pages=total_pages,
        total_chars=len(full_text),
        spans=spans,
        full_text=full_text,
        warnings=warnings,
    )


def extract_txt(file_bytes: bytes, filename: str) -> DocumentExtraction:
    """Extract text from a TXT file with line-level source spans."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = file_bytes.decode("latin-1")
        except Exception:
            raise IngestionError("The text file could not be decoded. Unsupported encoding.")

    if not text.strip():
        raise IngestionError("The text file is empty or contains only whitespace.")

    file_hash = hashlib.sha256(file_bytes).hexdigest()
    spans: list[SourceSpan] = []
    lines = text.split("\n")
    char_offset = 0
    chunk_idx = 0

    # Group lines into paragraph-like chunks
    current_chunk_lines: list[str] = []
    chunk_start_line = 1
    chunk_start_offset = 0

    for i, line in enumerate(lines, start=1):
        if line.strip():
            if not current_chunk_lines:
                chunk_start_line = i
                chunk_start_offset = char_offset
            current_chunk_lines.append(line)
        else:
            if current_chunk_lines:
                chunk_text = "\n".join(current_chunk_lines)
                spans.append(
                    SourceSpan(
                        span_id=_make_span_id(file_hash, None, chunk_idx),
                        page=None,
                        line_start=chunk_start_line,
                        line_end=i - 1,
                        char_offset_start=chunk_start_offset,
                        char_offset_end=chunk_start_offset + len(chunk_text),
                        text=chunk_text.strip(),
                    )
                )
                chunk_idx += 1
                current_chunk_lines = []
        char_offset += len(line) + 1  # +1 for newline

    # Flush remaining chunk
    if current_chunk_lines:
        chunk_text = "\n".join(current_chunk_lines)
        spans.append(
            SourceSpan(
                span_id=_make_span_id(file_hash, None, chunk_idx),
                page=None,
                line_start=chunk_start_line,
                line_end=len(lines),
                char_offset_start=chunk_start_offset,
                char_offset_end=chunk_start_offset + len(chunk_text),
                text=chunk_text.strip(),
            )
        )

    return DocumentExtraction(
        filename=filename,
        file_type="txt",
        total_pages=None,
        total_chars=len(text),
        spans=spans,
        full_text=text,
        warnings=[],
    )


def extract_document(file: BinaryIO, filename: str) -> DocumentExtraction:
    """Validate and extract a document, dispatching to the correct parser."""
    file_bytes = file.read()
    file_size = len(file_bytes)
    content_start = file_bytes[:8]

    validate_file(filename, file_size, content_start)
    logger.info("Processing uploaded file (type=%s, size=%d bytes)", Path(filename).suffix, file_size)

    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_pdf(file_bytes, filename)
    elif ext == ".txt":
        return extract_txt(file_bytes, filename)
    else:
        raise IngestionError(f"Unsupported file type: {ext}")


def _split_into_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs using double-newline or significant whitespace."""
    import re

    # Split on double newlines or multiple consecutive newlines
    paragraphs = re.split(r"\n\s*\n", text)
    # If no paragraph breaks found, split into sentence-like chunks
    if len(paragraphs) == 1 and len(text) > 500:
        # Fall back to splitting by single newlines for long blocks
        paragraphs = text.split("\n")
    return [p for p in paragraphs if p.strip()]
