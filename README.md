# Private Legal Document Triage Agent (PS2)

A privacy-first, local-first assistant for preliminary understanding of legal documents. It extracts clauses, explains them in plain language, identifies potential concerns, and ties each finding to an exact source passage.

> **Important:** This is an issue-spotting and document-understanding tool, not a lawyer or a source of definitive legal advice. It must not determine legal validity or make unsupported legal conclusions.

## PS2 compliance goals

- Parse PDF and TXT locally.
- Use a Gemma 3n-class edge model (or accepted Gemma 4 E2B/E4B edge-class variant) meaningfully and locally.
- Keep document files, extracted text, chunks, embeddings, summaries, answers, names, metadata, and user questions on the device.
- Ground findings in identifiable source passages and page numbers where available.
- Separate explicit text from interpretation/concern.
- Acknowledge ambiguity, missing evidence, and jurisdiction dependence; recommend a qualified legal professional when appropriate.
- Provide reproducible setup, tests, and privacy evidence.

## Suggested implementation stack

- Python 3.11+
- FastAPI backend
- Streamlit UI for the fastest working prototype (or React later, only if the team has time)
- PyMuPDF for PDF text extraction; standard library for TXT
- Local Ollama runtime with a compatible local Gemma model, or another documented local runtime
- Pydantic for typed outputs
- pytest for tests
- Ruff for linting
- No cloud LLM, cloud OCR, remote embeddings, analytics, or telemetry in normal processing

**Model note:** Verify that the exact Gemma variant, quantization, runtime, and licence satisfy the current event rules. Model weights must be downloaded during setup, not from private documents during processing. Ollama is one possible local runtime; confirm that the selected Gemma model is actually available and works on your hardware.

## Quick start (initial scaffold)

1. Install Python 3.11 or newer.
2. Install and start your chosen local Gemma runtime.
3. Download the approved Gemma model during setup and record the exact model tag, licence, quantization, file size, and runtime version in `docs/MODEL_CARD.md`.
4. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -e ".[dev]"
   ```
5. Copy `.env.example` to `.env` if your local runtime configuration needs it.
6. Implement the milestones in `docs/ROADMAP.md`; do not treat this documentation pack as a finished application.
7. Run tests with `pytest`.

## Repository structure

See `docs/PROJECT_STRUCTURE.md`.

## Privacy promises and limitations

- Default processing must work locally after model/dependencies are installed.
- Do not upload private documents or derived text to external services.
- Do not put document content in logs, crash reports, analytics, URLs, or exception messages.
- Network isolation must be tested and documented; do not claim offline privacy until verified.
- Deleting a session must remove its temporary files and any local session artefacts created by the app.
- Scanned PDFs may require local OCR; do not silently send them to a hosted OCR provider.
- This project does not establish whether a contract is enforceable or provide legal advice.

## Required evidence before submission

- A demo using a document not hard-coded into the application.
- Source passages and page/section references for each supported finding.
- A case where the document is silent and the agent says so.
- A refusal/limitation for “Is this enforceable?” or similar definitive legal questions.
- A reproducible run with network disabled, plus connection-monitoring evidence.
- Dependency/model/runtime versions, hardware and memory/speed measurements.
- Tests, known limitations, dataset/source licences, and a short technical contribution statement.
