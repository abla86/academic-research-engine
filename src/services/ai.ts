import { GoogleGenAI } from "@google/genai";
import { getDocument } from "./workspace.js";
import type {
  ResearchAnswer
} from "../types/index.js";

let client: GoogleGenAI | null = null;

function getClient() {

  if (
    !client &&
    process.env.GEMINI_API_KEY
  ) {

    client =
      new GoogleGenAI({
        apiKey:
          process.env.GEMINI_API_KEY
      });
  }

  return client;
}

export async function askResearch(
  question: string,
  documentIds: string[]
): Promise<ResearchAnswer> {

  if (!question?.trim()) {
    throw new Error(
      "question is required"
    );
  }

  const documents =
    documentIds
      .map(getDocument)
      .filter(Boolean);

  if (!documents.length) {

    return {
      mode: "fallback",
      answer:
        "Ingen kilder er valgt.",
      evidence: [],
      uncertainties: [
        "No source selected"
      ]
    };
  }

  const ai = getClient();

  if (!ai) {

    return {
      mode: "fallback",
      answer:
        "AI er ikke konfigurert. Bruk kilde-søk for å finne dokumentert tekst.",
      evidence: [],
      uncertainties: [
        "GEMINI_API_KEY is not configured"
      ]
    };
  }

  const context =
    documents
      .map(document =>
        [
          `DOCUMENT ID: ${document.id}`,
          `FILE: ${document.fileName}`,
          document.text.slice(
            0,
            18000
          )
        ].join("\n")
      )
      .join("\n\n");

  const prompt = `
You are a source-grounded academic research assistant.

Use ONLY the supplied source documents.

Rules:
1. Never invent facts.
2. Never invent citations.
3. Never invent quotations.
4. Never claim a source is verified unless verification is explicitly supplied.
5. Distinguish evidence from interpretation.
6. Identify uncertainty.
7. Every evidence item must identify its document.
8. Do not make an appraisal decision for the researcher.
9. Return JSON only.

JSON:
{
  "answer": "string",
  "evidence": [
    {
      "documentId": "string",
      "location": "string",
      "quote": "string"
    }
  ],
  "uncertainties": ["string"]
}

QUESTION:
${question}

SOURCE DOCUMENTS:
${context}
`;

  const response =
    await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType:
          "application/json"
      }
    });

  const parsed =
    JSON.parse(
      response.text || "{}"
    );

  return {
    mode: "ai",
    answer:
      parsed.answer || "",
    evidence:
      Array.isArray(
        parsed.evidence
      )
        ? parsed.evidence
        : [],
    uncertainties:
      Array.isArray(
        parsed.uncertainties
      )
        ? parsed.uncertainties
        : []
  };
}
