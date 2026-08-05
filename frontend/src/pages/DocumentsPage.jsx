import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument, fetchDocuments } = useDocumentStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const title = file.name.split('.')[0];
      const doc = await uploadDocument(file, title, 'Uploaded document');
      setDocuments([...documents, doc]);
      toast.success('Document uploaded successfully!');
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 My Documents</h1>
          <p className="text-slate-400">Upload and manage your study materials</p>
        </div>

        <div className="mb-8">
          <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
            <span>📤 Upload Document</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt,.md"
            />
          </label>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No documents yet. Upload one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-indigo-500 transition cursor-pointer"
                onClick={() => navigate(`/study-vault/${doc.id}`)}
              >
                <h3 className="font-semibold text-white mb-2">{doc.title}</h3>
                <p className="text-sm text-slate-400 mb-2">{doc.fileName}</p>
                <div className="text-xs text-slate-500">
                  <p>📖 {doc.readingTime} min read</p>
                  <p>📏 {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;