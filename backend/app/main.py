"""PS2 Private Legal Document Triage Agent — FastAPI application.

All endpoints are bound to localhost. No document content is logged.
No cloud fallback for any feature.
"""

from __future__ import annotations

import io
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.analysis import (
    analyze_document,
    answer_question,
    create_session,
    delete_session,
    get_session,
)
from app.config import settings
from app.ingestion import IngestionError, extract_document
from app.llm import check_model_health
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    DocumentExtraction,
    HealthResponse,
    PrivacyStatus,
    QuestionRequest,
    QuestionResponse,
    UploadResponse,
)

# Configure safe logging — never log document content
logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PS2 Private Legal Document Triage Agent",
    description=(
        "Local-first legal document analysis. "
        "This is NOT legal advice — consult a qualified professional."
    ),
    version="0.1.0",
)

# CORS — allow the local React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check service and model health."""
    model_status = await check_model_health()
    return HealthResponse(
        status="healthy" if model_status["available"] else "degraded",
        model_available=model_status["available"],
        model_name=settings.local_llm_model,
        ollama_url=settings.local_llm_base_url,
        message=model_status["message"],
    )


@app.get("/api/privacy", response_model=PrivacyStatus)
async def privacy_status():
    """Return current privacy configuration status."""
    model_status = await check_model_health()
    is_loopback = "127.0.0.1" in settings.local_llm_base_url or "localhost" in settings.local_llm_base_url
    return PrivacyStatus(
        model_local=model_status["available"],
        ollama_bound_to_loopback=is_loopback,
        no_cloud_fallback=True,
        session_cleanup_available=True,
        message=(
            "All processing is local. "
            "Document content never leaves your device during normal operation."
            if model_status["available"]
            else "Local model is not available. Analysis features are disabled."
        ),
    )


@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and extract a PDF or TXT document locally."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    try:
        file_bytes = await file.read()
        bio = io.BytesIO(file_bytes)
        extraction = extract_document(bio, file.filename)
    except IngestionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Unexpected error during file processing")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the file.",
        )

    session_id = create_session(extraction)
    logger.info("Upload complete: session=%s, spans=%d", session_id, len(extraction.spans))

    return UploadResponse(
        session_id=session_id,
        extraction=extraction,
    )


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze the uploaded document using local Gemma inference."""
    session = get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        result = await analyze_document(request.session_id)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis.",
        )


@app.post("/api/question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """Ask a question about the uploaded document."""
    session = get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = await answer_question(request.session_id, request.question)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Unexpected error during question answering")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while answering your question.",
        )


@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    """Delete a session and all associated data."""
    if delete_session(session_id):
        return {"status": "deleted", "session_id": session_id}
    raise HTTPException(status_code=404, detail="Session not found.")


@app.get("/api/session/{session_id}/extraction", response_model=DocumentExtraction)
async def get_extraction(session_id: str):
    """Get the extraction data for an existing session."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session
