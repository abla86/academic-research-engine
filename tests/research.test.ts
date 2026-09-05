import test from 'node:test';
import assert from 'node:assert/strict';
import { addDocument, searchDocuments, createClaim, verifyDocument } from '../src/services/workspace.js';
import { createEvidenceHandoff } from '../src/services/evidenceIntegration.js';
import { apa7, vancouver } from '../src/services/citations.js';

test('document ingestion and source search', () => {
  const document = addDocument({
    fileName: 'research.txt',
    mimeType: 'text/plain',
    sourceType: 'txt',
    text: 'Person-centred care may improve experiences in dementia care.',
  });

  const results = searchDocuments('person-centred', [document.id]);
  assert.ok(results.length > 0);
  assert.equal(results[0].documentId, document.id);
});

test('APA 7 citation', () => {
  const result = apa7({
    title: 'Example study',
    authors: ['Smith, J.'],
    year: 2025,
    journal: 'Example Journal',
    volume: '10',
    issue: '2',
    pages: '10-20',
    doi: '10.1000/example',
  });

  assert.match(result, /Smith/);
  assert.match(result, /10\.1000\/example/);
});

test('Vancouver citation', () => {
  const result = vancouver({
    title: 'Example study',
    authors: ['Smith J'],
    year: 2025,
    journal: 'Example Journal',
  });

  assert.match(result, /Smith J/);
});

test('evidence claim', () => {
  const claim = createClaim({
    claim: 'The study reports improved experience.',
    documentId: 'document-test',
    location: 'Page 4',
    quote: 'Example evidence',
    status: 'candidate',
  });

  assert.equal(claim.status, 'candidate');
});

test('verified claim requires human-verified source and verbatim quote', () => {
  const document = addDocument({
    fileName: 'verified.txt',
    sourceType: 'txt',
    text: 'The intervention improved patient-reported experience.',
  });

  assert.throws(() => createClaim({
    claim: 'The intervention improved experience.',
    documentId: document.id,
    quote: 'The intervention improved patient-reported experience.',
    status: 'verified',
  }), /HUMAN_VERIFIED/);

  verifyDocument(document.id);

  const verified = createClaim({
    claim: 'The intervention improved experience.',
    documentId: document.id,
    quote: 'The intervention improved patient-reported experience.',
    status: 'verified',
  });

  assert.equal(verified.status, 'verified');

  assert.throws(() => createClaim({
    claim: 'Unsupported claim.',
    documentId: document.id,
    quote: 'This sentence does not exist.',
    status: 'verified',
  }), /does not exist verbatim/);
});

test('evidence handoff rejects unverifiable or cross-document evidence', () => {
  const first = addDocument({
    fileName: 'first.txt',
    sourceType: 'txt',
    text: 'Verbatim source statement.',
  });
  const second = addDocument({
    fileName: 'second.txt',
    sourceType: 'txt',
    text: 'Different source statement.',
  });

  assert.throws(() => createEvidenceHandoff({
    contractVersion: '1.0.0',
    source: 'academic-research-engine',
    document: first,
    evidence: [{
      documentId: first.id,
      fileName: first.fileName,
      location: 'document',
      quote: 'Fabricated statement.',
    }],
  }), /not present verbatim/);

  assert.throws(() => createEvidenceHandoff({
    contractVersion: '1.0.0',
    source: 'academic-research-engine',
    document: first,
    evidence: [{
      documentId: second.id,
      fileName: second.fileName,
      location: 'document',
      quote: 'Different source statement.',
    }],
  }), /different document/);

  const handoff = createEvidenceHandoff({
    contractVersion: '1.0.0',
    source: 'academic-research-engine',
    document: first,
    evidence: [{
      documentId: first.id,
      fileName: first.fileName,
      location: 'document',
      quote: 'Verbatim source statement.',
    }],
  });

  assert.equal(handoff.document.id, first.id);
  assert.equal(handoff.evidence[0].fileName, first.fileName);
});
