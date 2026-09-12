import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Zap,
  Code,
  BookOpen,
  HelpCircle,
  Calculator,
  RefreshCw,
  Key,
  X
} from 'lucide-react';

export default function AiAssistant() {
  const { aiHistory, setAiHistory, aiModelUsed, setAiModelUsed } = useApp();
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('studyspace_gemini_key') || '');
  const messagesEndRef = useRef(null);

  const promptTemplates = [
    { label: '📐 Math Step-by-Step', prompt: 'Solve the following math problem step-by-step with formulas and clear explanations: ' },
    { label: '💻 Code & Complexity', prompt: 'Write an efficient solution in C++/Python with time and space complexity analysis for: ' },
    { label: '📝 Summarize Notes', prompt: 'Provide a concise bulleted summary and key takeaways for these lecture notes: ' },
    { label: '🧠 Practice Questions', prompt: 'Generate 3 high-yield practice questions with detailed answers on: ' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiHistory, loading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      localStorage.setItem('studyspace_gemini_key', customApiKey.trim());
    } else {
      localStorage.removeItem('studyspace_gemini_key');
    }
    setIsKeyModalOpen(false);
  };

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || loading) return;

    // Append user message
    const updatedHistory = [...aiHistory, { role: 'user', text: textToSend }];
    setAiHistory(updatedHistory);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const userKey = localStorage.getItem('studyspace_gemini_key');
      if (userKey) {
        headers['x-gemini-api-key'] = userKey;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: textToSend,
          systemInstruction: 'You are StudySpace AI, an intelligent, empathetic web tutor for college students. Explain concepts step-by-step with clear markdown headings, clean math formulas, and practical code examples.',
          history: updatedHistory.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiHistory(prev => [...prev, { role: 'model', text: data.text, modelUsed: data.modelUsed }]);
        if (data.modelUsed) setAiModelUsed(data.modelUsed);
      } else {
        setAiHistory(prev => [...prev, {
          role: 'model',
          text: '⚠️ **Gemini AI Service Notice**: The model is optimizing. Please resend your message in a moment.'
        }]);
      }
    } catch (err) {
      setAiHistory(prev => [...prev, {
        role: 'model',
        text: '⚠️ **Network Error**: Unable to reach StudySpace backend service. Please check your connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setAiHistory([
      {
        role: 'model',
        text: '👋 Chat history cleared. How can I assist your study session now?'
      }
    ]);
  };

  return (
    <div className="ai-page animate-fade-in">
      {/* Top Banner with Model Cascade Info */}
      <div className="ai-header glass-card">
        <div className="header-left">
          <div className="sparkle-badge">
            <Sparkles size={20} />
          </div>
          <div>
            <h2>StudySpace AI Tutor</h2>
            <span className="subtext">Zero-Downtime Multi-Model Cascade Engine (16,384 Token Limit)</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="model-cascade-pill glass-card">
            <Zap size={14} className="cascade-icon" />
            <span>Model: <strong>{aiModelUsed}</strong></span>
          </div>

          <button
            className="clear-btn glass-card"
            onClick={() => setIsKeyModalOpen(true)}
            title="Google Gemini API Key Settings"
          >
            <Key size={16} />
          </button>

          <button className="clear-btn glass-card" onClick={handleClear} title="Clear conversation">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Quick Prompt Templates */}
      <div className="prompt-templates-row">
        {promptTemplates.map((template, idx) => (
          <button
            key={idx}
            className="template-btn glass-card glass-card-interactive"
            onClick={() => {
              setInputPrompt(template.prompt);
            }}
          >
            {template.label}
          </button>
        ))}
      </div>

      {/* Message Chat Feed */}
      <div className="chat-feed glass-card">
        {aiHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="msg-header">
              <div className="author-info">
                {msg.role === 'user' ? (
                  <span className="author-name user">You</span>
                ) : (
                  <span className="author-name model">
                    <Sparkles size={14} /> StudySpace AI {msg.modelUsed && <small>({msg.modelUsed})</small>}
                  </span>
                )}
              </div>

              {msg.role === 'model' && (
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(msg.text, index)}
                  title="Copy text"
                >
                  {copiedIndex === index ? <Check size={14} className="copied" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            <div className="msg-content">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message model loading-message">
            <div className="typing-indicator">
              <RefreshCw size={16} className="spin-icon" />
              <span>StudySpace AI is formulating an in-depth answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-container glass-card">
        <input
          type="text"
          placeholder="Ask StudySpace AI any question or concept doubt..."
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={!inputPrompt.trim() || loading} className="gradient-button">
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>

      {/* Gemini API Key Modal */}
      {isKeyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Key size={20} style={{ color: 'var(--accent-amber)' }} />
                <h3 style={{ margin: 0 }}>Gemini API Settings</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              StudySpace automatically includes a zero-downtime academic fallback engine. To enable direct live <strong>Gemini 2.5 Flash</strong> queries, paste your Google AI Studio API key:
            </p>

            <form onSubmit={handleSaveKey}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Google AI Studio API Key (Starts with AIzaSy...)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={e => setCustomApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ background: 'rgba(30, 58, 95, 0.05)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                💡 <strong>How to get a key:</strong> Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google AI Studio</a>, click <em>Create API Key</em>, and paste it here. It is stored securely in your browser.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-button"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded AI Styles */}
      <style>{`
        .ai-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: calc(100vh - 120px);
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .sparkle-badge {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.18);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subtext {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .model-cascade-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          font-size: 0.78rem;
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.12);
        }

        .cascade-icon {
          color: #10b981;
        }

        .clear-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
        }

        .clear-btn:hover {
          color: var(--accent-red);
        }

        .prompt-templates-row {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .template-btn {
          padding: 0.55rem 0.95rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
        }

        .chat-feed {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1.1rem 1.25rem;
          border-radius: var(--radius-md);
          max-width: 90%;
        }

        .chat-message.user {
          align-self: flex-end;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .chat-message.model {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--card-border);
        }

        .msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .author-name {
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .author-name.user { color: #a5b4fc; }
        .author-name.model { color: var(--accent-cyan); }
        .author-name.model small { font-weight: 400; color: var(--text-muted); }

        .copy-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .copy-btn:hover { color: var(--text-primary); }
        .copy-btn .copied { color: var(--accent-green); }

        .msg-content {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--accent-primary);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .chat-input-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
        }

        .chat-input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
