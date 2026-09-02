import express from "express";
import cors from "cors";

import {
  addDocument,
  listDocuments,
  searchDocuments
} from "./workspace.js";

import { askResearch } from "./ai.js";
import { apa7, vancouver } from "./citations.js";

export function createResearchRouter() {

  const router = express.Router();

  router.use(
    express.json({
      limit: "25mb"
    })
  );

  router.post("/documents", (req, res) => {

    const {
      fileName,
      mimeType,
      text
    } = req.body;

    if (
      !fileName ||
      typeof text !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "fileName and text are required"
      });
    }

    return res.json({
      success: true,
      document: addDocument({
        fileName,
        mimeType,
        text
      })
    });
  });

  router.get("/documents", (_, res) => {

    res.json({
      success: true,
      documents: listDocuments()
    });
  });

  router.get("/search", (req, res) => {

    const query = String(
      req.query.q || ""
    ).trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "q is required"
      });
    }

    return res.json({
      success: true,
      results: searchDocuments(query)
    });
  });

  router.post("/ask", async (req, res) => {

    try {

      const {
        question,
        documentIds
      } = req.body;

      if (
        !question ||
        !Array.isArray(documentIds)
      ) {
        return res.status(400).json({
          success: false,
          error:
            "question and documentIds are required"
        });
      }

      const result = await askResearch(
        question,
        documentIds
      );

      return res.json({
        success: true,
        result
      });

    } catch (error) {

      return res.status(502).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Research AI failed"
      });
    }
  });

  router.post("/citation", (req, res) => {

    const {
      metadata,
      style = "apa7"
    } = req.body;

    if (!metadata?.title) {
      return res.status(400).json({
        success: false,
        error: "metadata.title is required"
      });
    }

    const citation =
      style === "vancouver"
        ? vancouver(metadata)
        : apa7(metadata);

    return res.json({
      success: true,
      style,
      citation
    });
  });

  return router;
}

export function createApp() {

  const app = express();

  app.use(cors());

  app.get("/health", (_, res) => {
    res.json({
      status: "ok",
      service:
        "academic-research-engine",
      version: "1.0.0"
    });
  });

  app.use(
    "/api/research",
    createResearchRouter()
  );

  return app;
}
