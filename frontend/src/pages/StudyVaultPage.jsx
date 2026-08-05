import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStudyVaultStore } from '../store';
import toast from 'react-hot-toast';

function StudyVaultPage() {
  const { documentId } = useParams();
  const [vault, setVault] = useState(null);
  const [activeTab, setActiveTab] = useState('definitions');
  const { extractVault, getVault } = useStudyVaultStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVault();
  }, [documentId]);

  const loadVault = async () => {
    try {
      // First try to get existing vault
      const existingVault = await getVault(documentId);
      setVault(existingVault);
    } catch (error) {
      // If not found, will need to extract
      setVault(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      const extractedVault = await extractVault(documentId, '');
      setVault(extractedVault);
      toast.success('Study vault extracted!');
    } catch (error) {
      toast.error('Failed to extract study vault');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🗄️ Study Vault</h1>
          <p className="text-slate-400">Extracted concepts, definitions, and study materials</p>
        </div>

        {!vault ? (
          <div className="text-center py-12">
            <button
              onClick={handleExtract}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              <span>🤖 Extract Study Materials</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-6 border-b border-slate-700">
              {['definitions', 'keywords', 'questions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === tab
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6">
              {activeTab === 'definitions' && (
                <div className="space-y-4">
                  {vault.definitions?.slice(0, 20).map((def, idx) => (
                    <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="font-semibold text-white">{def.term}</h3>
                      <p className="text-slate-300 text-sm mt-1">{def.definition}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-indigo-600/20 text-indigo-300 rounded">
                        {def.stage}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'keywords' && (
                <div className="flex flex-wrap gap-3">
                  {vault.keywords?.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-sm"
                    >
                      {kw.term || kw} ({kw.frequency || '1'}x)
                    </span>
                  ))}
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {vault.questions?.slice(0, 10).map((q, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded p-4">
                      <p className="text-white font-medium mb-2">{q.question}</p>
                      <p className="text-slate-300 text-sm">{q.expectedAnswer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyVaultPage;