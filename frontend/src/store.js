import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Store
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password, name });
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

// Document Store
export const useDocumentStore = create((set) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,

  uploadDocument: async (file, title, description) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      set((state) => ({
        documents: [...state.documents, response.data.document],
        isLoading: false
      }));
      return response.data.document;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Upload failed', isLoading: false });
      throw error;
    }
  },

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/documents');
      set({ documents: response.data.documents, isLoading: false });
      return response.data.documents;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch documents', isLoading: false });
      throw error;
    }
  },

  getDocument: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/documents/${documentId}`);
      set({ currentDocument: response.data.document, isLoading: false });
      return response.data.document;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch document', isLoading: false });
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/documents/${documentId}`);
      set((state) => ({
        documents: state.documents.filter(d => d.id !== documentId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete document', isLoading: false });
      throw error;
    }
  }
}));

// Study Vault Store
export const useStudyVaultStore = create((set) => ({
  vault: null,
  isLoading: false,
  error: null,

  extractVault: async (documentId, content) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/study-vault/${documentId}/extract`, { content });
      set({ vault: response.data.vault, isLoading: false });
      return response.data.vault;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Extraction failed', isLoading: false });
      throw error;
    }
  },

  getVault: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/study-vault/${documentId}`);
      set({ vault: response.data.vault, isLoading: false });
      return response.data.vault;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch vault', isLoading: false });
      throw error;
    }
  },

  updateTermMastery: async (documentId, termId, stage) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/study-vault/${documentId}/terms`, { termId, stage });
      set({ isLoading: false });
      return response.data.term;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Update failed', isLoading: false });
      throw error;
    }
  }
}));

// Flashcard Store
export const useFlashcardStore = create((set) => ({
  decks: new Map(),
  currentDeck: null,
  isLoading: false,
  error: null,

  createDeck: async (documentId, content, deckName, count = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/flashcards/${documentId}/create`, {
        content,
        deckName,
        count
      });
      set((state) => ({
        decks: new Map(state.decks).set(response.data.deckId, response.data.deck),
        currentDeck: response.data.deckId,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create deck', isLoading: false });
      throw error;
    }
  },

  getDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/flashcards/${deckId}`);
      set((state) => ({
        decks: new Map(state.decks).set(deckId, response.data.deck),
        currentDeck: deckId,
        isLoading: false
      }));
      return response.data.deck;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch deck', isLoading: false });
      throw error;
    }
  },

  rateCard: async (cardId, quality) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/flashcards/${cardId}/rate`, { quality });
      set({ isLoading: false });
      return response.data.card;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to rate card', isLoading: false });
      throw error;
    }
  },

  getDeckStats: async (deckId) => {
    try {
      const response = await api.get(`/flashcards/${deckId}/stats`);
      return response.data.stats;
    } catch (error) {
      throw error;
    }
  }
}));

// Quiz Store
export const useQuizStore = create((set) => ({
  quizzes: new Map(),
  currentSession: null,
  isLoading: false,
  error: null,

  generateQuiz: async (documentId, content, title, difficulty = 'medium', count = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/quizzes/${documentId}/generate`, {
        content,
        title,
        difficulty,
        count
      });
      set((state) => ({
        quizzes: new Map(state.quizzes).set(response.data.quizId, response.data.quiz),
        isLoading: false
      }));
      return response.data.quiz;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate quiz', isLoading: false });
      throw error;
    }
  },

  startQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/quizzes/${quizId}/start`, {});
      set({ currentSession: response.data.sessionId, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to start quiz', isLoading: false });
      throw error;
    }
  },

  submitAnswer: async (sessionId, questionIndex, answer) => {
    try {
      const response = await api.post(`/quizzes/${sessionId}/submit-answer`, {
        questionIndex,
        answer
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeQuiz: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/quizzes/${sessionId}/complete`, {});
      set({ currentSession: null, isLoading: false });
      return response.data.results;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to complete quiz', isLoading: false });
      throw error;
    }
  }
}));

// Concept Map Store
export const useConceptMapStore = create((set) => ({
  graphs: new Map(),
  currentGraph: null,
  isLoading: false,
  error: null,

  buildGraph: async (documentId, concepts) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/concept-map/${documentId}/build`, { concepts });
      set((state) => ({
        graphs: new Map(state.graphs).set(documentId, response.data.graph),
        currentGraph: documentId,
        isLoading: false
      }));
      return response.data.graph;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to build graph', isLoading: false });
      throw error;
    }
  },

  getGraph: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/concept-map/${documentId}`);
      set((state) => ({
        graphs: new Map(state.graphs).set(documentId, response.data.graph),
        currentGraph: documentId,
        isLoading: false
      }));
      return response.data.graph;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch graph', isLoading: false });
      throw error;
    }
  },

  expandNode: async (documentId, nodeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/concept-map/${documentId}/expand/${nodeId}`, {});
      set((state) => ({
        graphs: new Map(state.graphs).set(documentId, response.data.graph),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to expand node', isLoading: false });
      throw error;
    }
  }
}));

// Tutor Store
export const useTutorStore = create((set) => ({
  conversations: new Map(),
  currentConversation: null,
  isLoading: false,
  error: null,

  startConversation: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/tutor/conversation/start', {});
      set((state) => ({
        conversations: new Map(state.conversations).set(response.data.conversationId, []),
        currentConversation: response.data.conversationId,
        isLoading: false
      }));
      return response.data.conversationId;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to start conversation', isLoading: false });
      throw error;
    }
  },

  sendMessage: async (conversationId, message, documentContext) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        `/tutor/conversation/${conversationId}/message`,
        { message, documentContext }
      );
      set((state) => ({
        conversations: new Map(state.conversations).set(
          conversationId,
          [
            ...(state.conversations.get(conversationId) || []),
            { role: 'user', content: message },
            { role: 'assistant', content: response.data.tutorResponse }
          ]
        ),
        isLoading: false
      }));
      return response.data.tutorResponse;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to send message', isLoading: false });
      throw error;
    }
  },

  explainConcept: async (concept, passage) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/tutor/explain', { concept, passage });
      set({ isLoading: false });
      return response.data.explanation;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to explain', isLoading: false });
      throw error;
    }
  }
}));

export { api, API_URL };
