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
  RefreshCw
} from 'lucide-react';

// Math formula and Unicode sanitizer
function cleanMathFormulas(input) {
  if (!input) return '';
  let text = input;
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|textsf)\{([^}]+)\}/g, '$1');
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  const symbols = {
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\approx': '≈',
    '\\neq': '≠',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\infty': '∞',
    '\\pi': 'π',
    '\\theta': 'θ',
    '\\sqrt': '√'
  };
  Object.entries(symbols).forEach(([k, v]) => {
    text = text.replaceAll(k, v);
  });
  return text;
}

// Formatted Markdown, Code Blocks & Math Equations Renderer
function FormattedMessage({ content }) {
  if (!content) return null;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  return (
    <div className="formatted-msg-container space-y-3">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return (
            <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-white/15 bg-[#0D1117] shadow-lg font-mono text-xs">
              <div className="bg-[#161B22] px-4 py-2 flex items-center justify-between border-b border-white/10 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                <span>{part.language || 'Code Snippet'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(part.code)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Copy size={12} />
                  <span>Copy Code</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed font-mono selection:bg-emerald-500/30">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.value.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5 leading-relaxed">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-2" />;

              if (trimmed.startsWith('### ')) {
                return <h3 key={lIdx} className="text-base font-bold text-amber-300 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
              }
              if (trimmed.startsWith('## ')) {
                return <h2 key={lIdx} className="text-lg font-bold text-indigo-300 mt-4 mb-1">{trimmed.replace('## ', '')}</h2>;
              }
              if (trimmed.startsWith('# ')) {
                return <h1 key={lIdx} className="text-xl font-extrabold text-white mt-4 mb-2">{trimmed.replace('# ', '')}</h1>;
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                const bulletText = trimmed.replace(/^[-•]\s*/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{parseInlineFormatting(bulletText)}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="text-xs sm:text-sm text-gray-200">{parseInlineFormatting(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineFormatting(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-300 border border-white/10">{chunk.slice(1, -1)}</code>;
    }
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2) {
      return <span key={i} className="inline-block bg-indigo-950/60 text-amber-300 font-mono px-2 py-0.5 rounded border border-indigo-500/30 text-xs shadow-sm">{chunk.slice(1, -1)}</span>;
    }
    return chunk;
  });
}

export default function AiAssistant() {
  const { aiHistory, setAiHistory, aiModelUsed, setAiModelUsed } = useApp();
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const promptTemplates = [
    { label: '📊 Build PPT Slides', prompt: 'Outline a 5-slide presentation deck with titles, key bullet points, formulas, and speaker notes for topic: ' },
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

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || loading) return;

    // Append user message
    const updatedHistory = [...aiHistory, { role: 'user', text: textToSend }];
    setAiHistory(updatedHistory);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          systemInstruction: 'You are StudySpace AI, an intelligent, empathetic web tutor for college students. Explain concepts step-by-step with clear markdown headings, clean math formulas, and practical code examples.',
          history: updatedHistory.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setAiHistory(prev => [...prev, { role: 'model', text: data.text, modelUsed: data.modelUsed || 'StudySpace AI', isFallback: Boolean(data.isFallback) }]);
          if (data.modelUsed) setAiModelUsed(data.modelUsed);
          return;
        } else if (data.error) {
          setAiHistory(prev => [...prev, { role: 'model', text: `⚠️ **Request Failed**: ${data.error}`, isError: true }]);
          return;
        }
      }
      
      const errText = await response.text().catch(() => '');
      setAiHistory(prev => [...prev, { role: 'model', text: `⚠️ **Request Failed (HTTP ${response.status})**: ${errText || response.statusText || 'No error details returned from server.'}`, isError: true }]);
    } catch (err) {
      setAiHistory(prev => [...prev, { role: 'model', text: `⚠️ **Connection Failed**: Unable to reach backend server. ${err.message}`, isError: true }]);
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
      {/* Top Banner with Model Info */}
      <div className="ai-header glass-card">
        <div className="header-left">
          <div className="sparkle-badge">
            <Sparkles size={20} />
          </div>
          <div>
            <h2>StudySpace AI Tutor</h2>
            <span className="subtext">Zero-Downtime Academic Engine (16,384 Token Limit)</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="model-cascade-pill glass-card">
            <Zap size={14} className="cascade-icon" />
            <span>Engine: <strong>{aiModelUsed || 'StudySpace AI'}</strong></span>
          </div>

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
                    {msg.isFallback && <small className="fallback-badge" title="Live AI was unavailable; this is an offline template response.">Offline mode</small>}
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
              <FormattedMessage content={msg.text} />
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

        .fallback-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--accent-amber, #D97706);
          background: rgba(217, 119, 6, 0.12);
          border: 1px solid rgba(217, 119, 6, 0.3);
          border-radius: 999px;
          padding: 0.1rem 0.5rem;
          margin-left: 0.25rem;
        }

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
          white-space: pre-wrap;
          word-break: break-word;
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
