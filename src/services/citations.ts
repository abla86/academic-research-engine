import type {
  CitationMetadata,
  CitationRecord,
  VerificationStatus
} from "../types/index.js";

function clean(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function doiUrl(doi: string) {
  return `https://doi.org/${doi.replace(
    /^https?:\/\/doi\.org\//i,
    ""
  )}`;
}

export function apa7(
  metadata: CitationMetadata
) {

  const authors =
    metadata.authors.length
      ? metadata.authors.join(", ")
      : "Unknown author";

  const year =
    metadata.year
      ? `(${metadata.year})`
      : "(n.d.)";

  const title =
    metadata.title
      .trim()
      .replace(/[.]+$/, "");

  const journal =
    metadata.journal
      ? ` ${metadata.journal}`
      : "";

  const volume =
    metadata.volume
      ? `, ${metadata.volume}`
      : "";

  const issue =
    metadata.issue
      ? `(${metadata.issue})`
      : "";

  const pages =
    metadata.pages
      ? `, ${metadata.pages}`
      : "";

  const identifier =
    metadata.doi
      ? ` ${doiUrl(metadata.doi)}`
      : metadata.url
        ? ` ${metadata.url}`
        : "";

  return clean(
    `${authors} ${year}. ${title}.${journal}${volume}${issue}${pages}.${identifier}`
  );
}

export function vancouver(
  metadata: CitationMetadata
) {

  const authors =
    metadata.authors
      .slice(0, 6)
      .join(", ") +
    (
      metadata.authors.length > 6
        ? ", et al."
        : ""
    );

  return clean(
    `${authors}. ${metadata.title}. ${
      metadata.journal ?? ""
    }. ${metadata.year ?? ""};${
      metadata.volume ?? ""
    }${
      metadata.issue
        ? `(${metadata.issue})`
        : ""
    }:${
      metadata.pages ?? ""
    }.`
  );
}

export function createCitationRecord(
  metadata: CitationMetadata
): CitationRecord {

  const status: VerificationStatus =
    metadata.verified
      ? "verified"
      : metadata.doi || metadata.pmid
        ? "candidate"
        : "unverified";

  return {
    ...metadata,
    id:
      crypto.randomUUID(),
    createdAt:
      new Date().toISOString(),
    status
  };
}
