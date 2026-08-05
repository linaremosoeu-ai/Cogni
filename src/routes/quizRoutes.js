import express from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { protect } from '../utils/authMiddleware.js';
import { validateQuizInput } from '../utils/validators.js';
import quizEngine from '../utils/quizEngine.js';
import geminiService from '../utils/geminiService.js';

const router = express.Router();

router.post('/:documentId/generate', protect, asyncHandler(async (req, res) => {
  const { content, count = 5, difficulty = 'medium' } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const questions = await geminiService.generateQuizQuestions(content, count, difficulty);

  const quizId = quizEngine.createQuiz(
    req.body.title || `Quiz for Document ${req.params.documentId}`,
    req.body.description,
    questions,
    difficulty
  );

  res.status(201).json({
    success: true,
    quizId: quizId,
    quiz: {
      id: quizId,
      title: req.body.title,
      totalQuestions: questions.length,
      difficulty: difficulty,
      questions: questions
    }
  });
}));

router.post('/:quizId/start', protect, (req, res) => {
  const { userId } = req.body;
  const sessionId = quizEngine.startSession(req.params.quizId, userId || req.user.userId);

  if (!sessionId) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const session = quizEngine.getSession(sessionId);
  const quiz = quizEngine.getQuiz(req.params.quizId);

  res.status(201).json({
    success: true,
    sessionId: sessionId,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      totalQuestions: quiz.totalQuestions,
      questions: quiz.questions
    }
  });
});

router.post('/:sessionId/submit-answer', protect, (req, res) => {
  const { questionIndex, answer } = req.body;
  if (questionIndex === undefined || answer === undefined) {
    return res.status(400).json({ error: 'Question index and answer required' });
  }

  const session = quizEngine.submitAnswer(req.params.sessionId, questionIndex, answer);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    success: true,
    session: {
      sessionId: session.id,
      currentQuestionIndex: session.currentQuestionIndex
    }
  });
});

router.post('/:sessionId/complete', protect, (req, res) => {
  const session = quizEngine.completeQuiz(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    success: true,
    results: {
      sessionId: session.id,
      score: session.score,
      passed: session.passed,
      feedback: session.feedback,
      totalTime: session.endTime - session.startTime
    }
  });
});

router.get('/:quizId/stats', protect, (req, res) => {
  const stats = quizEngine.getQuizStats(req.params.quizId);
  if (!stats) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  res.json({
    success: true,
    stats: stats
  });
});

export default router;