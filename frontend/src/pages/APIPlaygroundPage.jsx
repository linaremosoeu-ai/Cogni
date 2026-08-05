import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../store';

function APIPlaygroundPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!url) {
      toast.error('URL is required');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.post('/api-playground/test', {
        method,
        url,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : null
      });
      setResponse(result.data);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message
      });
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💻 API Playground</h1>
          <p className="text-slate-400">Test REST APIs and explore responses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Request</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Headers (JSON)</label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-sm h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-sm h-24"
                  placeholder='{"key": "value"}'
                />
              </div>

              <button
                onClick={handleTest}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : '🚀 Send Request'}
              </button>
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Response</h2>
            
            {response ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Status Code</p>
                  <p className="font-mono text-white bg-slate-700/50 p-2 rounded">
                    {response.statusCode || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Headers</p>
                  <pre className="font-mono text-xs text-green-400 bg-slate-700/50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Body</p>
                  <pre className="font-mono text-xs text-blue-400 bg-slate-700/50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(response.data || response.error, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Send a request to see the response</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default APIPlaygroundPage;