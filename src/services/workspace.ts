import crypto from "node:crypto";
import type {
  ResearchDocument,
  EvidenceClaim,
  DocumentSourceType
} from "../types/index.js";

const documents = new Map<string, ResearchDocument>();
const claims = new Map<string, EvidenceClaim>();

export function addDocument(input: {
  fileName: string;
  mimeType?: string;
  sourceType?: DocumentSourceType;
  text: string;
}) {

  if (!input.fileName) {
    throw new Error("fileName is required");
  }

  if (!input.text.trim()) {
    throw new Error("Document text cannot be empty");
  }

  const document: ResearchDocument = {
    id: crypto.randomUUID(),
    fileName: input.fileName,
    mimeType: input.mimeType,
    sourceType: input.sourceType ?? "unknown",
    text: input.text,
    createdAt: new Date().toISOString(),
    verification: "unverified"
  };

  documents.set(document.id, document);

  return document;
}

export function getDocument(id: string) {
  return documents.get(id);
}

export function listDocuments() {

  return [...documents.values()].map(document => ({
    id: document.id,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sourceType: document.sourceType,
    characters: document.text.length,
    createdAt: document.createdAt,
    verification: document.verification
  }));
}

export function searchDocuments(
  query: string,
  documentIds?: string[]
) {

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map(term => term.trim())
    .filter(Boolean);

  if (!terms.length) {
    return [];
  }

  const allowed =
    documentIds?.length
      ? new Set(documentIds)
      : undefined;

  const results: Array<{
    documentId: string;
    fileName: string;
    location: string;
    quote: string;
  }> = [];

  for (const document of documents.values()) {

    if (
      allowed &&
      !allowed.has(document.id)
    ) {
      continue;
    }

    const lower =
      document.text.toLowerCase();

    for (const term of terms) {

      let position =
        lower.indexOf(term);

      let count = 0;

      while (
        position >= 0 &&
        count < 10
      ) {

        results.push({
          documentId: document.id,
          fileName: document.fileName,
          location:
            `character:${position}`,
          quote:
            document.text.slice(
              Math.max(0, position - 220),
              Math.min(
                document.text.length,
                position + 600
              )
            )
        });

        position =
          lower.indexOf(
            term,
            position + 1
          );

        count++;
      }
    }
  }

  return results.slice(0, 100);
}

export function createClaim(
  input: Omit<
    EvidenceClaim,
    "id" | "createdAt"
  >
) {

  const claim: EvidenceClaim = {
    ...input,
    id: crypto.randomUUID(),
    createdAt:
      new Date().toISOString()
  };

  claims.set(
    claim.id,
    claim
  );

  return claim;
}

export function listClaims() {
  return [...claims.values()];
}

export function verifyDocument(
  id: string
) {

  const document =
    documents.get(id);

  if (!document) {
    throw new Error(
      "Document not found"
    );
  }

  document.verification =
    "verified";

  return document;
}
