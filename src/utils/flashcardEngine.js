import { v4 as uuidv4 } from 'uuid';

class FlashcardEngine {
  constructor() {
    this.cards = new Map();
    this.decks = new Map();
  }

  createDeck(name, description = '') {
    const deckId = uuidv4();
    const deck = {
      id: deckId,
      name,
      description,
      cards: [],
      stats: {
        totalCards: 0,
        learned: 0,
        learning: 0,
        new: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.decks.set(deckId, deck);
    return deckId;
  }

  createCard(deckId, front, back, difficulty = 'medium', tags = []) {
    const cardId = uuidv4();
    const card = {
      id: cardId,
      deckId,
      front,
      back,
      difficulty,
      tags,
      stats: {
        attempts: 0,
        correct: 0,
        incorrect: 0,
        easeFactor: 2.5,
        interval: 0,
        nextReview: new Date(),
        stage: 'new'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.cards.set(cardId, card);
    
    const deck = this.decks.get(deckId);
    if (deck) {
      deck.cards.push(cardId);
      deck.stats.totalCards++;
      deck.stats.new++;
      deck.updatedAt = new Date();
    }
    
    return cardId;
  }

  rateCard(cardId, quality) {
    const card = this.cards.get(cardId);
    if (!card) return null;

    const stats = card.stats;
    stats.attempts++;

    if (quality >= 3) {
      stats.correct++;
    } else {
      stats.incorrect++;
    }

    stats.easeFactor = Math.max(
      1.3,
      stats.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (stats.attempts === 1) {
      stats.interval = 1;
    } else if (stats.attempts === 2) {
      stats.interval = 3;
    } else {
      stats.interval = Math.round(stats.interval * stats.easeFactor);
    }

    if (stats.attempts < 3) {
      stats.stage = 'learning';
    } else if (quality >= 3) {
      if (stats.interval >= 21) {
        stats.stage = 'mastered';
      } else {
        stats.stage = 'review';
      }
    } else {
      stats.stage = 'learning';
    }

    stats.nextReview = new Date();
    stats.nextReview.setDate(stats.nextReview.getDate() + stats.interval);
    
    card.updatedAt = new Date();
    this.updateDeckStats(card.deckId);

    return card;
  }

  updateDeckStats(deckId) {
    const deck = this.decks.get(deckId);
    if (!deck) return;

    deck.stats = {
      totalCards: deck.cards.length,
      learned: deck.cards.filter(id => {
        const card = this.cards.get(id);
        return card?.stats.stage === 'mastered';
      }).length,
      learning: deck.cards.filter(id => {
        const card = this.cards.get(id);
        return card?.stats.stage === 'learning';
      }).length,
      new: deck.cards.filter(id => {
        const card = this.cards.get(id);
        return card?.stats.stage === 'new';
      }).length
    };
  }

  getNextCards(deckId, limit = 20) {
    const deck = this.decks.get(deckId);
    if (!deck) return [];

    const now = new Date();
    const cardsToReview = deck.cards
      .map(id => this.cards.get(id))
      .filter(card => card.stats.nextReview <= now)
      .sort((a, b) => {
        const stageOrder = { new: 0, learning: 1, review: 2, mastered: 3 };
        return stageOrder[a.stats.stage] - stageOrder[b.stats.stage];
      })
      .slice(0, limit);

    return cardsToReview;
  }

  getDeckStats(deckId) {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    const cards = deck.cards.map(id => this.cards.get(id));
    
    return {
      ...deck.stats,
      averageAccuracy: cards.length > 0
        ? (cards.reduce((sum, card) => sum + (card.stats.correct / Math.max(1, card.stats.attempts)), 0) / cards.length * 100).toFixed(2)
        : 0,
      averageEaseFactor: (cards.reduce((sum, card) => sum + card.stats.easeFactor, 0) / cards.length).toFixed(2),
      cardsReviewedToday: cards.filter(card => {
        const today = new Date().toDateString();
        return card.updatedAt.toDateString() === today;
      }).length
    };
  }

  resetCard(cardId) {
    const card = this.cards.get(cardId);
    if (!card) return null;

    card.stats = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      easeFactor: 2.5,
      interval: 0,
      nextReview: new Date(),
      stage: 'new'
    };

    card.updatedAt = new Date();
    this.updateDeckStats(card.deckId);
    return card;
  }

  getCardsByTag(deckId, tag) {
    const deck = this.decks.get(deckId);
    if (!deck) return [];

    return deck.cards
      .map(id => this.cards.get(id))
      .filter(card => card.tags.includes(tag));
  }

  searchCards(deckId, query) {
    const deck = this.decks.get(deckId);
    if (!deck) return [];

    const lowerQuery = query.toLowerCase();
    return deck.cards
      .map(id => this.cards.get(id))
      .filter(card => 
        card.front.toLowerCase().includes(lowerQuery) ||
        card.back.toLowerCase().includes(lowerQuery)
      );
  }

  getDeckCards(deckId) {
    const deck = this.decks.get(deckId);
    if (!deck) return [];

    return deck.cards.map(id => this.cards.get(id));
  }
}

export default new FlashcardEngine();