# Academic Research Engine

Standalone, reusable academic research engine for source-grounded research workflows and integration into evidence-appraisal, thesis, clinical knowledge, guideline and implementation applications.

## Features

- PDF, DOCX, TXT and Markdown text extraction
- searchable research workspace
- source-grounded AI Q&A
- evidence provenance: document → location → quote
- candidate/verified status
- evidence claims
- APA 7 and Vancouver citation formatting
- DOI/PMID-ready metadata
- REST API
- deterministic fallback without an AI key
- integration contract independent of appraisal logic

## Integrity

AI output is candidate output. It does not automatically establish truth, publication validity, study quality or appraisal results. Human verification remains explicit.

AI-generated evidence is accepted into structured results only when its quoted text is matched verbatim to one of the selected source documents. Unverifiable AI evidence is rejected rather than treated as evidence.

Verified claims require a HUMAN_VERIFIED source document and a verbatim quote from that document.

## Runtime and security boundary

The current workspace is in-memory and is not a durable database.

The /api/research/extract endpoint only reads files within RESEARCH_DOCUMENT_ROOT, which defaults to ./documents, and rejects path traversal.

Set ALLOWED_ORIGINS to a comma-separated list of browser origins when cross-origin browser access is required. CORS is disabled when no allowed origin is configured.

This repository is an API/service package. It does not currently contain a browser UI; consumers are responsible for their own UI.

## Run

```powershell
npm install
npm test
npm run build
npm start
```

Open http://localhost:4100/health.

## Integration

The engine can be mounted into the Complete Evidence Appraisal Tool or other applications through the HTTP API or exported TypeScript services.
