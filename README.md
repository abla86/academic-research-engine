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
- browser UI
- deterministic fallback without an AI key
- integration contract independent of appraisal logic

## Integrity
AI output is candidate output. It does not automatically establish truth, publication validity, study quality or appraisal results. Human verification remains explicit.

## Run
```powershell
npm install
npm test
npm start
```
Open `http://localhost:4100`.

## Integration
The same engine can be mounted into the Complete Evidence Appraisal Tool or other applications through the HTTP API or exported TypeScript services.