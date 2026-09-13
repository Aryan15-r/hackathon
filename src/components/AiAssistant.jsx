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

function CodeBlockComponent({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#1E3A5F]/20 bg-[#0D1117] shadow-xl font-mono text-xs">
      <div className="bg-[#161B22] px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-[11px] text-gray-300 font-semibold tracking-wide">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-amber-400" />
          <span className="uppercase text-amber-300 font-bold">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="hover:bg-white/10 px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed font-mono selection:bg-emerald-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Formatted Markdown, Code Blocks, Tables & Math Equations Renderer
function FormattedMessage({ content, isUser = false }) {
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
          return <CodeBlockComponent key={pIdx} language={part.language} code={part.code} />;
        }

        const lines = part.value.split('\n');
        let tableRows = [];
        let inTable = false;

        const renderedBlocks = [];

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          // Markdown Table parsing
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;
            if (!trimmed.includes('---')) {
              const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
              tableRows.push(cells);
            }
            return;
          } else if (inTable) {
            inTable = false;
            if (tableRows.length > 0) {
              const headerRow = tableRows[0];
              const bodyRows = tableRows.slice(1);
              renderedBlocks.push(
                <div key={`table-${lIdx}`} className="my-3 overflow-x-auto rounded-xl border border-[#1E3A5F]/15 bg-white shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1E3A5F] text-white font-bold font-['Outfit']">
                        {headerRow.map((cell, cIdx) => (
                          <th key={cIdx} className="p-3 border-b border-white/10">{parseInlineFormatting(cell, isUser)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bodyRows.map((r, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDF6EC]/40'}>
                          {r.map((cell, cIdx) => (
                            <th key={cIdx} className="p-3 border-t border-[#1E3A5F]/10 font-normal text-[#1A1A2E]">{parseInlineFormatting(cell, isUser)}</th>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
              tableRows = [];
            }
          }

          if (!trimmed) {
            renderedBlocks.push(<div key={lIdx} className="h-1.5" />);
            return;
          }

          // Block Math Equation ($$ ... $$)
          if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
            const mathExp = cleanMathLatex(trimmed.slice(2, -2).trim());
            renderedBlocks.push(
              <div key={lIdx} className="my-3 p-3.5 rounded-2xl bg-[#1E3A5F]/5 border border-[#1E3A5F]/15 text-center font-mono text-xs font-bold text-[#1E3A5F] shadow-inner">
                {mathExp}
              </div>
            );
            return;
          }

          // Headings
          if (trimmed.startsWith('### ')) {
            renderedBlocks.push(
              <h3 key={lIdx} className={`text-sm font-bold font-['Outfit'] mt-3 mb-1 ${isUser ? 'text-white' : 'text-[#1E3A5F]'}`}>
                {trimmed.replace('### ', '')}
              </h3>
            );
            return;
          }
          if (trimmed.startsWith('## ')) {
            renderedBlocks.push(
              <h2 key={lIdx} className={`text-base font-bold font-['Outfit'] mt-4 mb-1 ${isUser ? 'text-white' : 'text-[#1E3A5F]'}`}>
                {trimmed.replace('## ', '')}
              </h2>
            );
            return;
          }
          if (trimmed.startsWith('# ')) {
            renderedBlocks.push(
              <h1 key={lIdx} className={`text-lg font-extrabold font-['Outfit'] mt-4 mb-2 ${isUser ? 'text-white' : 'text-[#1E3A5F]'}`}>
                {trimmed.replace('# ', '')}
              </h1>
            );
            return;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            renderedBlocks.push(
              <blockquote key={lIdx} className={`pl-3.5 py-1 my-2 border-l-3 ${isUser ? 'border-amber-300 text-white/90' : 'border-amber-500 text-[#1A1A2E]/80'} italic text-xs`}>
                {parseInlineFormatting(trimmed.replace('> ', ''), isUser)}
              </blockquote>
            );
            return;
          }

          // Bullet List
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-•*]\s*/, '');
            renderedBlocks.push(
              <div key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-2 my-0.5">
                <span className={`font-bold ${isUser ? 'text-amber-300' : 'text-amber-600'}`}>•</span>
                <span>{parseInlineFormatting(bulletText, isUser)}</span>
              </div>
            );
            return;
          }

          // Numbered List
          if (/^\d+\.\s/.test(trimmed)) {
            const numStr = trimmed.match(/^\d+\./)?.[0] || '1.';
            const itemText = trimmed.replace(/^\d+\.\s*/, '');
            renderedBlocks.push(
              <div key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-2 my-0.5">
                <span className={`font-bold ${isUser ? 'text-amber-300' : 'text-[#1E3A5F]'}`}>{numStr}</span>
                <span>{parseInlineFormatting(itemText, isUser)}</span>
              </div>
            );
            return;
          }

          // Standard Paragraph
          renderedBlocks.push(
            <p key={lIdx} className={`text-xs sm:text-sm leading-relaxed ${isUser ? 'text-white' : 'text-[#1A1A2E]'}`}>
              {parseInlineFormatting(line, isUser)}
            </p>
          );
        });

        // Flush remaining table if at end
        if (tableRows.length > 0) {
          const headerRow = tableRows[0];
          const bodyRows = tableRows.slice(1);
          renderedBlocks.push(
            <div key="table-end" className="my-3 overflow-x-auto rounded-xl border border-[#1E3A5F]/15 bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1E3A5F] text-white font-bold font-['Outfit']">
                    {headerRow.map((cell, cIdx) => (
                      <th key={cIdx} className="p-3 border-b border-white/10">{parseInlineFormatting(cell, isUser)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDF6EC]/40'}>
                      {r.map((cell, cIdx) => (
                        <th key={cIdx} className="p-3 border-t border-[#1E3A5F]/10 font-normal text-[#1A1A2E]">{parseInlineFormatting(cell, isUser)}</th>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <div key={pIdx} className="space-y-1">{renderedBlocks}</div>;
      })}
    </div>
  );
}

function cleanMathLatex(text) {
  if (!text) return '';
  return text
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow|\\implies/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\Leftrightarrow|\\iff/g, '⇔')
    .replace(/\\qquad/g, '    ')
    .replace(/\\quad/g, '  ')
    .replace(/\\emptyset|\\empty/g, '∅')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq|\\ne/g, '≠')
    .replace(/\\leq|\\le/g, '≤')
    .replace(/\\geq|\\ge/g, '≥')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\infty/g, '∞')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathbb\{([^}]+)\}/g, '$1');
}

function parseInlineFormatting(str, isUser = false) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={i} className={`font-bold ${isUser ? 'text-white' : 'text-[#1E3A5F]'}`}>
          {cleanMathLatex(chunk.slice(2, -2))}
        </strong>
      );
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={i} className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${
          isUser ? 'bg-white/15 text-amber-200 border-white/20' : 'bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20 font-semibold'
        }`}>
          {chunk.slice(1, -1)}
        </code>
      );
    }
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2) {
      return (
        <span key={i} className="inline-block bg-[#1E3A5F] text-amber-300 font-mono px-2 py-0.5 rounded text-xs shadow-sm font-bold">
          {cleanMathLatex(chunk.slice(1, -1))}
        </span>
      );
    }
    return <span key={i} className={isUser ? 'text-white' : 'text-[#1A1A2E]'}>{cleanMathLatex(chunk)}</span>;
  });
}

function generateClientAcademicFallback(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('newton') || p.includes('force') || p.includes('physics')) {
    return `### 🍎 Newton's Second Law of Motion\n\nNewton's Second Law states that the acceleration of an object depends on the net force acting upon it and the mass of the object.\n\n#### Mathematical Formula:\n$$ F = m \\cdot a $$\nWhere:\n- **$F$**: Net Force (Newtons, $N$)\n- **$m$**: Mass (Kilograms, $kg$)\n- **$a$**: Acceleration ($m/s^2$)\n\n#### Example Calculation:\nIf a $10kg$ object accelerates at $5m/s^2$, the force is:\n$$ F = 10 \\times 5 = 50\\text{ N} $$`;
  }
  if (p.includes('python') || p.includes('code') || p.includes('algorithm') || p.includes('sort') || p.includes('dijkstra')) {
    return `### 🐍 Code Implementation & Analysis\n\nHere is an efficient implementation:\n\n\`\`\`python\ndef solve_problem(data):\n    # Time Complexity: O(n log n)\n    # Space Complexity: O(n)\n    return sorted(data)\n\n# Example execution\nprint(solve_problem([5, 2, 8, 1, 9]))\n\`\`\`\n\n#### Key Takeaways:\n1. **Time Complexity**: $O(n \\log n)$ average sorting runtime.\n2. **Memory Overhead**: $O(n)$ space requirement.`;
  }
  if (p.includes('math') || p.includes('calculus') || p.includes('integral') || p.includes('derivative')) {
    return `### 📐 Calculus & Mathematical Analysis\n\nFor continuous functions $f(x)$, the fundamental theorem connects derivatives and definite integrals:\n\n#### Fundamental Theorem of Calculus:\n$$ \\int_{a}^{b} f(x) \\, dx = F(b) - F(a) $$\nwhere $F'(x) = f(x)$.\n\n#### Common Rules:\n1. **Power Rule**: $\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}$\n2. **Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u'v + uv'$`;
  }
  return `### ⚠️ Live AI Service Temporarily Unavailable\n\nWe could not connect to a live AI model for **"${prompt}"**, and no matching curated offline template exists for this specific subject.\n\n#### Available Offline Topics:\n- **Physics & Newton's Laws** (e.g. *"Explain Newton's second law"*)\n- **Coding & Algorithms** (e.g. *"Python sorting algorithm"*)\n- **Math & Calculus** (e.g. *"Fundamental theorem of calculus"*)\n\n*Please ensure a valid GEMINI_API_KEY is configured in your environment to query any topic live.*`;
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
        }
      }

      // If HTTP 405 or backend error, use client academic generator
      const fallbackText = generateClientAcademicFallback(textToSend);
      setAiHistory(prev => [...prev, { role: 'model', text: fallbackText, modelUsed: 'StudySpace AI (Offline Engine)', isFallback: true }]);
      setAiModelUsed('StudySpace AI (Offline Engine)');
    } catch (err) {
      const fallbackText = generateClientAcademicFallback(textToSend);
      setAiHistory(prev => [...prev, { role: 'model', text: fallbackText, modelUsed: 'StudySpace AI (Offline Engine)', isFallback: true }]);
      setAiModelUsed('StudySpace AI (Offline Engine)');
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
              <FormattedMessage content={msg.text} isUser={msg.role === 'user'} />
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
          background: #1E3A5F;
          border: 1px solid #152b46;
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(30, 58, 95, 0.15);
        }

        .chat-message.model {
          align-self: flex-start;
          background: #FFFFFF;
          border: 1.5px solid rgba(30, 58, 95, 0.15);
          box-shadow: 0 4px 20px rgba(30, 58, 95, 0.06);
          color: #1A1A2E;
        }

        .msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .author-name {
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .author-name.user { color: #FCD34D; }
        .author-name.model { color: #1E3A5F; }
        .author-name.model small { font-weight: 500; color: #6B7280; }

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
