# PS2 Legal Document Triage Agent — Frontend

Modern, high-performance, responsive React + TypeScript + Vite web dashboard for local, private legal document analysis.

## Key Features

- **Local-First Privacy Dashboard**: Real-time status badge monitoring local loopback connectivity (`127.0.0.1:11434` / `127.0.0.1:8000`) and verifying zero cloud leakage.
- **Drag-and-Drop Ingestion**: Upload PDF and TXT legal agreements with instant validation for file formats and sizes.
- **Verifiable Evidence Inspector**: Clickable page-aware source citations showing exact extracted spans, page numbers, character offsets, and line numbers.
- **Interactive Clause Triage**:
  - Categorization across obligations, rights, deadlines, fees, penalties, terminations, liabilities, and confidentiality.
  - Plain-language explanations of complex legalese.
  - Potential risk warnings and document silence (omitted terms).
  - Prepared legal questions to ask an attorney.
- **Extracted Text Viewer**: Side-by-side full text preview with dynamic passage highlighting.
- **Local Q&A Assistant**: Inquire about clauses, risks, or liabilities directly with the local Gemma model.
- **Complete Session Control**: One-click session reset to purge in-memory document text.

## Tech Stack

- **Framework**: React 18, Vite 6, TypeScript 5
- **Styling**: Tailored design system with CSS custom properties (dark mode, glassmorphism, responsive grid)
- **Icons**: Clean, dependency-free SVGs
- **Build**: Fast ES module compilation with zero vulnerabilities

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

### 4. Configuration
By default, the frontend connects to the backend at `http://localhost:8000`. You can configure this via `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
