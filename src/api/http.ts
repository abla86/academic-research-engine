import express from "express";
import cors from "cors";

import {
  addDocument,
  listDocuments,
  searchDocuments,
  createClaim,
  listClaims,
  verifyDocument
} from "./workspace.js";

import {
  apa7,
  vancouver
} from "./citations.js";

import {
  askResearch
} from "./ai.js";

import {
  extractText
} from "./extractor.js";

export function createResearchRouter() {

  const router =
    express.Router();

  router.use(
    express.json({
      limit: "30mb"
    })
  );

  router.get(
    "/documents",
    (_, res) => {

      res.json({
        success: true,
        documents:
          listDocuments()
      });
    }
  );

  router.post(
    "/documents",
    (req, res) => {

      try {

        const {
          fileName,
          mimeType,
          sourceType,
          text
        } = req.body;

        if (
          !fileName ||
          typeof text !== "string"
        ) {

          return res.status(400)
            .json({
              success: false,
              error:
                "fileName and text are required"
            });
        }

        return res.json({
          success: true,
          document:
            addDocument({
              fileName,
              mimeType,
              sourceType,
              text
            })
        });

      } catch (error) {

        return res.status(400)
          .json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Document error"
          });
      }
    }
  );

  router.get(
    "/search",
    (req, res) => {

      const q =
        String(
          req.query.q || ""
        ).trim();

      if (!q) {

        return res.status(400)
          .json({
            success: false,
            error:
              "q is required"
          });
      }

      return res.json({
        success: true,
        results:
          searchDocuments(q)
      });
    }
  );

  router.post(
    "/ask",
    async (req, res) => {

      try {

        const {
          question,
          documentIds
        } = req.body;

        if (
          !question ||
          !Array.isArray(
            documentIds
          )
        ) {

          return res.status(400)
            .json({
              success: false,
              error:
                "question and documentIds are required"
            });
        }

        return res.json({
          success: true,
          result:
            await askResearch(
              question,
              documentIds
            )
        });

      } catch (error) {

        return res.status(502)
          .json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Research AI failed"
          });
      }
    }
  );

  router.post(
    "/citation",
    (req, res) => {

      const {
        metadata,
        style = "apa7"
      } = req.body;

      if (
        !metadata ||
        !metadata.title
      ) {

        return res.status(400)
          .json({
            success: false,
            error:
              "metadata.title is required"
          });
      }

      const citation =
        style === "vancouver"
          ? vancouver(metadata)
          : apa7(metadata);

      return res.json({
        success: true,
        style,
        citation,
        verification:
          metadata.verified === true
            ? "verified"
            : "candidate/unverified"
      });
    }
  );

  router.post(
    "/claims",
    (req, res) => {

      try {

        return res.json({
          success: true,
          claim:
            createClaim(
              req.body
            )
        });

      } catch (error) {

        return res.status(400)
          .json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Claim error"
          });
      }
    }
  );

  router.get(
    "/claims",
    (_, res) => {

      res.json({
        success: true,
        claims:
          listClaims()
      });
    }
  );

  router.post(
    "/documents/:id/verify",
    (req, res) => {

      try {

        return res.json({
          success: true,
          document:
            verifyDocument(
              req.params.id
            )
        });

      } catch (error) {

        return res.status(404)
          .json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Document not found"
          });
      }
    }
  );

  router.post(
    "/extract",
    async (req, res) => {

      try {

        if (
          typeof req.body.filePath !==
          "string"
        ) {

          return res.status(400)
            .json({
              success: false,
              error:
                "filePath is required"
            });
        }

        const extracted =
          await extractText(
            req.body.filePath
          );

        return res.json({
          success: true,
          extracted
        });

      } catch (error) {

        return res.status(400)
          .json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Extraction failed"
          });
      }
    }
  );

  return router;
}

export function createApp() {

  const app =
    express();

  app.use(cors());

  app.get(
    "/health",
    (_, res) => {

      res.json({
        status: "ok",
        service:
          "academic-research-engine",
        version: "1.0.0"
      });
    }
  );

  app.use(
    "/api/research",
    createResearchRouter()
  );

  return app;
}
