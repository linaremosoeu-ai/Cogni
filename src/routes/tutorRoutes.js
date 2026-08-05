import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import geminiService from '../utils/geminiService.js';

const router = express.Router();
const conversations = new Map();

router.post('/chat', protect, asyncHandler(async (req, res) => {
  const { message, documentContext = '' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = await geminiService.tutorChat(message, documentContext);

  res.json({
    success: true,
    response: response
  });
}));

router.post('/explain', protect, asyncHandler(async (req, res) => {
  const { passage, concept } = req.body;
  if (!passage || !concept) {
    return res.status(400).json({ error: 'Passage and concept are required' });
  }

  const explanation = await geminiService.explainConcept(concept, passage);

  res.json({
    success: true,
    explanation: explanation
  });
}));

router.post('/conversation/start', protect, (req, res) => {
  const conversationId = `conv_${Date.now()}_${req.user.userId}`;
  conversations.set(conversationId, {
    id: conversationId,
    userId: req.user.userId,
    messages: [],
    createdAt: new Date()
  });

  res.status(201).json({
    success: true,
    conversationId: conversationId
  });
});

router.post('/conversation/:conversationId/message', protect, asyncHandler(async (req, res) => {
  const { message, documentContext } = req.body;
  const conversation = conversations.get(req.params.conversationId);

  if (!conversation || conversation.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = await geminiService.tutorChat(message, documentContext);

  conversation.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });

  conversation.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date()
  });

  res.json({
    success: true,
    userMessage: message,
    tutorResponse: response,
    messageCount: conversation.messages.length
  });
}));

export default router;