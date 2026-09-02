export type EvidenceHandoff = {
  source: {
    engine: "academic-research-engine";
    version: string;
    documentId: string;
    fileName: string;
  };
  study: {
    title?: string;
    authors?: string;
    year?: number;
    doi?: string;
    studyDesign?: string;
    recommendedInstrumentId?: string;
  };
  evidence: {
    location: string;
    quote: string;
    verifiedByResearcher: boolean;
    status: "AI_CANDIDATE" | "HUMAN_VERIFIED" | "MANUAL";
  }[];
  citation?: {
    apa7?: string;
    vancouver?: string;
  };
};

export function createEvidenceHandoff(input: EvidenceHandoff): EvidenceHandoff {
  return {
    ...input,
    source: {
      ...input.source,
      engine: "academic-research-engine"
    }
  };
}
