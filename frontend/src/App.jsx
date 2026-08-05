import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import StudyVaultPage from './pages/StudyVaultPage';
import ConceptMapPage from './pages/ConceptMapPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';
import TutorPage from './pages/TutorPage';
import APIPlaygroundPage from './pages/APIPlaygroundPage';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/auth" replace />;
}

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-vault/:documentId"
          element={
            <ProtectedRoute>
              <StudyVaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/concept-map/:documentId"
          element={
            <ProtectedRoute>
              <ConceptMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards/:deckId"
          element={
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId"
          element={
            <ProtectedRoute>
              <QuizzesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <TutorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-playground"
          element={
            <ProtectedRoute>
              <APIPlaygroundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
