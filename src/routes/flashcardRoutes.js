import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import { validateFlashcard } from '../utils/validators.js';
import flashcardEngine from '../utils/flashcardEngine.js';
import geminiService from '../utils/geminiService.js';

const router = express.Router();

router.post('/:documentId/create', protect, asyncHandler(async (req, res) => {
  const { content, count = 10 } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const deckId = flashcardEngine.createDeck(
    req.body.deckName || `Document ${req.params.documentId}`,
    req.body.deckDescription
  );

  const generatedCards = await geminiService.generateFlashcards(content, count);

  const cardIds = [];
  generatedCards.forEach(card => {
    const cardId = flashcardEngine.createCard(
      deckId,
      card.front,
      card.back,
      card.difficulty,
      ['auto-generated']
    );
    cardIds.push(cardId);
  });

  res.status(201).json({
    success: true,
    deckId: deckId,
    cardsCreated: cardIds.length,
    deck: flashcardEngine.decks.get(deckId)
  });
}));

router.get('/:deckId', protect, (req, res) => {
  const deck = flashcardEngine.decks.get(req.params.deckId);
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  const cards = flashcardEngine.getDeckCards(req.params.deckId);
  res.json({
    success: true,
    deck: {
      ...deck,
      cards: cards
    }
  });
});

router.get('/:deckId/next', protect, (req, res) => {
  const { limit = 20 } = req.query;
  const nextCards = flashcardEngine.getNextCards(req.params.deckId, parseInt(limit));

  res.json({
    success: true,
    cards: nextCards
  });
});

router.post('/:cardId/rate', protect, asyncHandler(async (req, res) => {
  const { quality } = req.body;
  if (quality === undefined || quality < 0 || quality > 5) {
    return res.status(400).json({ error: 'Quality must be 0-5' });
  }

  const card = flashcardEngine.rateCard(req.params.cardId, quality);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.json({
    success: true,
    card: card
  });
}));

router.get('/:deckId/stats', protect, (req, res) => {
  const stats = flashcardEngine.getDeckStats(req.params.deckId);
  if (!stats) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  res.json({
    success: true,
    stats: stats
  });
});

export default router;