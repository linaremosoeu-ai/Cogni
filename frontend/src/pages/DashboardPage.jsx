import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const features = [
    {
      icon: '📚',
      title: 'Study Vault',
      description: 'Extract key concepts, definitions, and study materials from documents',
      path: '/documents'
    },
    {
      icon: '🕸️',
      title: 'Concept Map',
      description: 'Visualize relationships between concepts with interactive knowledge graphs',
      path: '/documents'
    },
    {
      icon: '🎴',
      title: 'Flashcards',
      description: 'Master topics with AI-generated adaptive flashcard decks',
      path: '/documents'
    },
    {
      icon: '📝',
      title: 'Quizzes',
      description: 'Test your knowledge with AI-powered adaptive quizzes',
      path: '/documents'
    },
    {
      icon: '🤖',
      title: 'AI Tutor',
      description: 'Get instant explanations and context-grounded learning support',
      path: '/tutor'
    },
    {
      icon: '💻',
      title: 'API Playground',
      description: 'Test REST APIs and explore architecture diagrams interactively',
      path: '/api-playground'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🧠</span> Cogni
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Welcome to Cogni</h2>
          <p className="text-lg text-slate-300">
            Your AI-powered learning companion. Choose a module to get started.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => navigate(feature.path)}
              className="group cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500 rounded-xl p-6 transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-400">0</div>
            <div className="text-sm text-indigo-300 mt-1">Documents</div>
          </div>
          <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">0</div>
            <div className="text-sm text-emerald-300 mt-1">Study Streaks</div>
          </div>
          <div className="bg-amber-600/20 border border-amber-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">0%</div>
            <div className="text-sm text-amber-300 mt-1">Mastery</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;