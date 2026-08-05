import React, { useState, useEffect } from 'react';
import { useTutorStore } from '../store';
import toast from 'react-hot-toast';

function TutorPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { startConversation, sendMessage } = useTutorStore();

  useEffect(() => {
    initConversation();
  }, []);

  const initConversation = async () => {
    try {
      const convId = await startConversation();
      setConversationId(convId);
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your AI study tutor. Ask me anything about your study materials or concepts you\'d like to understand better.'
      }]);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(conversationId, userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">🤖 AI Study Tutor</h1>
          <p className="text-slate-400">Ask questions and get instant explanations</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg">
                  <p className="text-sm animate-pulse">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-slate-700 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TutorPage;