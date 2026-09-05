import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

import {
  addDocument, listDocuments, getDocument, searchDocuments, createClaim, listClaims,
  verifyDocument, setDocumentVerification,
} from '../services/workspace.js';
import { apa7, vancouver, createCitationRecord } from '../services/citations.js';
import { askResearch } from '../services/ai.js';
import { extractText } from '../services/extractor.js';
import { createEvidenceHandoff } from '../services/evidenceIntegration.js';

const VERSION = '2.0.0';

function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? '').split(',').map(origin => origin.trim()).filter(Boolean);
}

export function createResearchRouter() {
  const router = express.Router();
  router.use(express.json({ limit: '30mb' }));

  router.get('/documents', (_req, res) => res.json({ success: true, documents: listDocuments() }));

  router.get('/documents/:id', (req, res) => {
    const document = getDocument(req.params.id);
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
    return res.json({ success: true, document });
  });

  router.post('/documents', (req, res) => {
    try {
      const { fileName, mimeType, sourceType, text } = req.body ?? {};
      if (typeof fileName !== 'string' || !fileName.trim() || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ success: false, error: 'fileName and text are required' });
      }
      return res.status(201).json({ success: true, document: addDocument({ fileName, mimeType, sourceType, text }) });
    } catch (error) {
      return res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Document error' });
    }
  });

  router.get('/search', (req, res) => {
    const query = String(req.query.q ?? '').trim();
    if (!query) return res.status(400).json({ success: false, error: 'q is required' });
    const rawIds = req.query.documentIds;
    const documentIds = Array.isArray(rawIds)
      ? rawIds.map(String)
      : typeof rawIds === 'string' ? rawIds.split(',').map(item => item.trim()).filter(Boolean) : undefined;
    return res.json({ success: true, results: searchDocuments(query, documentIds) });
  });

  router.post('/ask', async (req, res) => {
    try {
      const question = String(req.body?.question ?? '').trim();
      const documentIds = req.body?.documentIds;
      if (!question || !Array.isArray(documentIds) || documentIds.some((id: unknown) => typeof id !== 'string')) {
        return res.status(400).json({ success: false, error: 'question and documentIds are required' });
      }
      return res.json({ success: true, result: await askResearch(question, documentIds) });
    } catch (error) {
      return res.status(502).json({ success: false, error: error instanceof Error ? error.message : 'Research AI failed' });
    }
  });

  router.post('/citation', (req, res) => {
    const metadata = req.body?.metadata;
    const style = req.body?.style === 'vancouver' ? 'vancouver' : 'apa7';
    if (!metadata || typeof metadata.title !== 'string' || !metadata.title.trim() || !Array.isArray(metadata.authors)) {
      return res.status(400).json({ success: false, error: 'metadata.title and metadata.authors are required' });
    }
    const record = createCitationRecord(metadata);
    const citation = style === 'vancouver' ? vancouver(record) : apa7(record);
    return res.json({ success: true, style, citation, record });
  });

  router.post('/claims', (req, res) => {
    try {
      return res.status(201).json({ success: true, claim: createClaim(req.body) });
    } catch (error) {
      return res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Claim error' });
    }
  });

  router.get('/claims', (_req, res) => res.json({ success: true, claims: listClaims() }));

  router.post('/documents/:id/verify', (req, res) => {
    try {
      return res.json({ success: true, document: verifyDocument(req.params.id) });
    } catch (error) {
      return res.status(404).json({ success: false, error: error instanceof Error ? error.message : 'Document not found' });
    }
  });

  router.post('/documents/:id/verification', (req, res) => {
    try {
      const status = req.body?.status;
      if (!['UNVERIFIED', 'AI_CANDIDATE', 'HUMAN_VERIFIED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid verification status' });
      }
      return res.json({ success: true, document: setDocumentVerification(req.params.id, status) });
    } catch (error) {
      return res.status(404).json({ success: false, error: error instanceof Error ? error.message : 'Document not found' });
    }
  });

  router.post('/extract', async (req, res) => {
    try {
      if (typeof req.body?.filePath !== 'string' || !req.body.filePath.trim()) {
        return res.status(400).json({ success: false, error: 'filePath is required' });
      }
      return res.json({ success: true, extracted: await extractText(req.body.filePath) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Extraction failed';
      const status = message.includes('inside RESEARCH_DOCUMENT_ROOT') ? 400 : 422;
      return res.status(status).json({ success: false, error: message });
    }
  });

  router.post('/handoff', (req, res) => {
    try {
      return res.json({ success: true, handoff: createEvidenceHandoff(req.body) });
    } catch (error) {
      return res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Evidence handoff failed' });
    }
  });

  return router;
}

export function createApp() {
  const app = express();
  const origins = allowedOrigins();

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });
  app.use(cors(origins.length ? { origin: origins } : { origin: false }));

  app.get('/health', (_req, res) => res.json({
    status: 'ok',
    service: 'academic-research-engine',
    version: VERSION,
  }));

  app.use('/api/research', createResearchRouter());
  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
  app.use((_error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (!res.headersSent) res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}
