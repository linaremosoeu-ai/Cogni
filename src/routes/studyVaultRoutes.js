import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import geminiService from '../utils/geminiService.js';
import documentParser from '../utils/documentParser.js';

const router = express.Router();
const vaults = new Map();

router.get('/:documentId', protect, (req, res) => {
  const vault = vaults.get(req.params.documentId);
  if (!vault) {
    return res.status(404).json({ error: 'Study vault not found' });
  }

  res.json({
    success: true,
    vault: {
      documentId: req.params.documentId,
      definitions: vault.definitions,
      keywords: vault.keywords,
      questions: vault.questions,
      diagrams: vault.diagrams,
      tables: vault.tables,
      extractedAt: vault.extractedAt
    }
  });
});

router.post('/:documentId/extract', protect, asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const textChunks = documentParser.chunkText(content, 3000);
  const allConcepts = { concepts: [], keyTerms: [] };

  for (const chunk of textChunks) {
    const concepts = await geminiService.extractConceptsFromText(chunk);
    allConcepts.concepts.push(...(concepts.concepts || []));
    allConcepts.keyTerms.push(...(concepts.keyTerms || []));
  }

  const definitions = allConcepts.concepts.map(c => ({
    term: c.name,
    definition: c.definition,
    stage: 'new',
    category: c.category
  }));

  const keywords = allConcepts.keyTerms.slice(0, 30);
  
  const reviewQuestions = await geminiService.extractReviewQuestions(content.substring(0, 5000));

  const vault = {
    documentId: req.params.documentId,
    definitions: definitions.slice(0, 50),
    keywords: keywords,
    questions: reviewQuestions.questions || [],
    diagrams: [],
    tables: [],
    extractedAt: new Date()
  };

  vaults.set(req.params.documentId, vault);

  res.json({
    success: true,
    message: 'Study vault extracted successfully',
    vault: vault
  });
}));

router.put('/:documentId/terms', protect, (req, res) => {
  const { termId, stage } = req.body;
  const vault = vaults.get(req.params.documentId);

  if (!vault) {
    return res.status(404).json({ error: 'Study vault not found' });
  }

  const term = vault.definitions.find(t => t.term === termId);
  if (!term) {
    return res.status(404).json({ error: 'Term not found' });
  }

  term.stage = stage;
  term.updatedAt = new Date();

  res.json({
    success: true,
    message: 'Term updated',
    term: term
  });
});

export default router;