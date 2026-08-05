import React from 'react';

function ConceptMapPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">🕸️ Concept Map</h1>
        <p className="text-slate-400 mb-8">Interactive visualization of concept relationships</p>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-300">D3.js concept map visualization will render here</p>
        </div>
      </div>
    </div>
  );
}

export default ConceptMapPage;