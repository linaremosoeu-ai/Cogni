import { v4 as uuidv4 } from 'uuid';

class QuizEngine {
  constructor() {
    this.quizzes = new Map();
    this.sessions = new Map();
  }

  createQuiz(title, description, questions, difficulty = 'medium') {
    const quizId = uuidv4();
    const quiz = {
      id: quizId,
      title,
      description,
      questions,
      difficulty,
      totalQuestions: questions.length,
      timeLimit: null,
      passingScore: 70,
      stats: {
        totalAttempts: 0,
        averageScore: 0,
        successRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.quizzes.set(quizId, quiz);
    return quizId;
  }

  startSession(quizId, userId) {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) return null;

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      quizId,
      userId,
      answers: {},
      startTime: new Date(),
      endTime: null,
      score: null,
      passed: null,
      feedback: [],
      currentQuestionIndex: 0
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  submitAnswer(sessionId, questionIndex, answer) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.answers[questionIndex] = answer;
    session.currentQuestionIndex = Math.max(session.currentQuestionIndex, questionIndex + 1);
    return session;
  }

  completeQuiz(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const quiz = this.quizzes.get(session.quizId);
    if (!quiz) return null;

    session.endTime = new Date();
    const { score, feedback } = this.calculateScore(session, quiz);
    
    session.score = score;
    session.passed = score >= quiz.passingScore;
    session.feedback = feedback;

    quiz.stats.totalAttempts++;
    quiz.stats.averageScore = (
      (quiz.stats.averageScore * (quiz.stats.totalAttempts - 1) + score) /
      quiz.stats.totalAttempts
    );
    quiz.stats.successRate = (
      quiz.stats.successRate * (quiz.stats.totalAttempts - 1) +
      (session.passed ? 100 : 0)
    ) / quiz.stats.totalAttempts;

    return session;
  }

  calculateScore(session, quiz) {
    let correctCount = 0;
    const feedback = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = session.answers[index];
      let isCorrect = false;

      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.answer;
      } else if (question.type === 'true-false') {
        isCorrect = userAnswer === question.answer;
      } else if (question.type === 'short-answer') {
        isCorrect = userAnswer?.toLowerCase() === question.answer.toLowerCase();
      }

      if (isCorrect) {
        correctCount++;
      }

      feedback.push({
        questionIndex: index,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctCount / quiz.totalQuestions) * 100);
    return { score, feedback };
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getQuiz(quizId) {
    return this.quizzes.get(quizId);
  }

  generateAdaptiveQuiz(baseQuestions, userPerformance) {
    let difficulty = 'medium';
    
    if (userPerformance.averageScore > 80) {
      difficulty = 'hard';
    } else if (userPerformance.averageScore < 50) {
      difficulty = 'easy';
    }

    const filteredQuestions = baseQuestions.filter(
      q => !userPerformance.incorrectTopics || 
           !userPerformance.incorrectTopics.includes(q.topic)
    );

    if (userPerformance.incorrectTopics?.length > 0) {
      const focusedQuestions = filteredQuestions
        .filter(q => userPerformance.incorrectTopics.includes(q.topic))
        .slice(0, Math.ceil(filteredQuestions.length / 2));
      
      const otherQuestions = filteredQuestions
        .filter(q => !userPerformance.incorrectTopics.includes(q.topic))
        .slice(0, Math.floor(filteredQuestions.length / 2));
      
      return [...focusedQuestions, ...otherQuestions];
    }

    return filteredQuestions;
  }

  getQuizStats(quizId) {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) return null;

    const sessions = Array.from(this.sessions.values())
      .filter(s => s.quizId === quizId);

    return {
      ...quiz.stats,
      totalSessions: sessions.length,
      passedSessions: sessions.filter(s => s.passed).length,
      averageTimeMinutes: sessions.length > 0
        ? (sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / sessions.length / 1000 / 60).toFixed(2)
        : 0
    };
  }
}

export default new QuizEngine();