# Academic Research Engine

[![CI](https://github.com/abla86/academic-research-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/abla86/academic-research-engine/actions/workflows/ci.yml)
[![CodeQL](https://github.com/abla86/academic-research-engine/actions/workflows/codeql.yml/badge.svg)](https://github.com/abla86/academic-research-engine/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/abla86/academic-research-engine/badge)](https://securityscorecards.dev/viewer/?uri=github.com/abla86/academic-research-engine)

Standalone, reusable TypeScript research engine for source-grounded academic workflows. It is designed to provide a provenance layer for evidence-appraisal, thesis, clinical knowledge, guideline and implementation applications.

## Features

- PDF, DOCX, TXT and Markdown text extraction
- searchable research workspace
- source-grounded AI Q&A
- evidence provenance: document → location → quote
- candidate/verified evidence status
- structured evidence claims
- APA 7 and Vancouver citation formatting
- DOI/PMID-ready metadata
- REST API and reusable TypeScript services
- deterministic fallback without an AI key
- explicit integration contract independent of appraisal logic

## Research integrity

AI output is candidate output. It does not automatically establish truth, publication validity, study quality or appraisal results. Human verification remains explicit. Public demonstrations use synthetic or non-identifying data.

## Quick start

```bash
npm install
npm run typecheck
npm test
npm run build
npm start
```

The local server is available at `http://localhost:4100`.

## Use as a package

The project is structured as a reusable TypeScript package. The build emits JavaScript, source maps and TypeScript declarations into `dist/`.

```bash
npm install @abla86/academic-research-engine
```

The package exposes the research types, workspace, citation, extraction, AI, evidence-handoff and HTTP services through the public entry point.

## Integration

The engine can be used standalone or integrated into the [Complete Evidence Appraisal Tool](https://github.com/abla86/complete-evidence-appraisal-tool) through HTTP or TypeScript services. The integration contract keeps document ingestion, search, provenance and citation responsibilities separate from appraisal methodology.

## Quality and security

CI validates metadata, type safety, tests and production builds. CodeQL and OpenSSF Scorecard provide security analysis, while Dependabot and dependency review help keep dependencies maintainable. See `SECURITY.md` for vulnerability reporting and `CONTRIBUTING.md` for development and contribution rules.

## Verification

The supported local verification path is:

```bash
npm install
npm run typecheck
npm test
npm run build
```

Interactive demonstrations in `docs/` are deterministic and do not require production credentials.

## Contributing

Contributions are welcome. Start with `CONTRIBUTING.md`, keep changes focused, add regression tests for behavior changes, and preserve evidence provenance and human-verification boundaries.

## License

MIT. See `LICENSE`.
