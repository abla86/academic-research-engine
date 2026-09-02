import type { EvidenceHandoff as CanonicalEvidenceHandoff } from '../types/index.js';

export const EVIDENCE_HANDOFF_CONTRACT_VERSION = '1.0.0' as const;

export type EvidenceHandoff = CanonicalEvidenceHandoff;

export function createEvidenceHandoff(input: EvidenceHandoff): EvidenceHandoff {
  if (input.contractVersion !== EVIDENCE_HANDOFF_CONTRACT_VERSION) {
    throw new Error(`Unsupported evidence handoff contract: ${input.contractVersion}`);
  }
  if (input.source !== 'academic-research-engine') {
    throw new Error('Evidence handoff source must be academic-research-engine');
  }
  if (!input.document.id || !input.document.fileName) {
    throw new Error('Evidence handoff requires a document id and file name');
  }
  return {
    contractVersion: EVIDENCE_HANDOFF_CONTRACT_VERSION,
    source: 'academic-research-engine',
    document: { ...input.document, text: input.document.text },
    evidence: input.evidence.map(item => ({ ...item })),
    citation: input.citation ? { ...input.citation } : undefined,
  };
}

export function buildEvidenceHandoff(
  document: CanonicalEvidenceHandoff['document'],
  evidence: CanonicalEvidenceHandoff['evidence'],
  citation?: CanonicalEvidenceHandoff['citation'],
): EvidenceHandoff {
  return createEvidenceHandoff({
    contractVersion: EVIDENCE_HANDOFF_CONTRACT_VERSION,
    source: 'academic-research-engine',
    document,
    evidence,
    citation,
  });
}
