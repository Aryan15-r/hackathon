import React, { useState } from 'react';
import { Calculator as CalcIcon, History, Trash2, Delete, CornerDownLeft } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([
    { expression: 'sin(30) + cos(60)', result: '1' },
    { expression: '2^10', result: '1024' },
    { expression: 'log(100)', result: '2' }
  ]);

  const handleInput = (val) => {
    setDisplay(prev => prev + val);
  };

  const handleClear = () => {
    setDisplay('');
    setResult('');
  };

  const handleDelete = () => {
    setDisplay(prev => prev.slice(0, -1));
  };

  const evaluateExpression = () => {
    if (!display.trim()) return;
    try {
      let sanitized = display
        .replaceAll('×', '*')
        .replaceAll('÷', '/')
        .replaceAll('π', 'Math.PI')
        .replaceAll('e', 'Math.E')
        .replaceAll('sin', 'Math.sin')
        .replaceAll('cos', 'Math.cos')
        .replaceAll('tan', 'Math.tan')
        .replaceAll('log', 'Math.log10')
        .replaceAll('ln', 'Math.log')
        .replaceAll('sqrt', 'Math.sqrt')
        .replaceAll('^', '**');

      // Factorial handling
      if (sanitized.includes('!')) {
        sanitized = sanitized.replace(/(\d+)!/g, (match, n) => {
          let num = parseInt(n);
          let fact = 1;
          for (let i = 2; i <= num; i++) fact *= i;
          return fact;
        });
      }

      // Safe evaluation using Function
      // eslint-disable-next-line no-new-func
      const evalFn = new Function(`"use strict"; return (${sanitized});`);
      const evalResult = evalFn();
      const formatted = Number.isInteger(evalResult) ? evalResult.toString() : Number(evalResult).toFixed(4);

      setResult(formatted);
      setHistory(prev => [{ expression: display, result: formatted }, ...prev]);
    } catch (e) {
      setResult('Error');
    }
  };

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'sqrt'],
    ['log', 'ln', '^', '!'],
    ['π', 'e', '(', ')'],
    ['MC', 'MR', 'M+', 'MS']
  ];

  const keypad = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '%', '+']
  ];

  return (
    <div className="calc-page animate-fade-in">
      <div className="calc-header glass-card">
        <h2>Scientific Calculator</h2>
        <p>In-browser scientific calculator with math memory & execution history stack.</p>
      </div>

      <div className="calc-workspace">
        {/* Main Calculator Unit */}
        <div className="calc-unit glass-card">
          {/* Screen Display */}
          <div className="calc-display-screen glass-card">
            <div className="calc-expression">{display || '0'}</div>
            <div className="calc-result">{result ? `= ${result}` : ''}</div>
          </div>

          {/* Scientific Controls */}
          <div className="calc-keypad-grid">
            {scientificButtons.map((row, rIdx) => (
              <div key={rIdx} className="btn-row">
                {row.map(btn => (
                  <button
                    key={btn}
                    className="calc-btn sci glass-card"
                    onClick={() => {
                      if (btn === 'MC') setMemory(0);
                      else if (btn === 'MR') setDisplay(prev => prev + memory);
                      else if (btn === 'M+') setMemory(prev => prev + (parseFloat(result) || 0));
                      else if (btn === 'MS') setMemory(parseFloat(result) || 0);
                      else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(btn)) handleInput(`${btn}(`);
                      else handleInput(btn);
                    }}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}

            {/* Numbers & Arithmetic */}
            {keypad.map((row, rIdx) => (
              <div key={rIdx} className="btn-row">
                {row.map(btn => (
                  <button
                    key={btn}
                    className={`calc-btn ${['÷', '×', '-', '+'].includes(btn) ? 'op' : 'num'} glass-card`}
                    onClick={() => handleInput(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}

            {/* Clear & Evaluate Row */}
            <div className="btn-row">
              <button className="calc-btn danger glass-card" onClick={handleClear}>C</button>
              <button className="calc-btn glass-card" onClick={handleDelete}><Delete size={18} /></button>
              <button className="calc-btn eval gradient-button" onClick={evaluateExpression}>
                <CornerDownLeft size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Math Calculation History Log */}
        <div className="calc-history glass-card">
          <div className="history-header">
            <History size={18} className="hist-icon" />
            <h3>Calculation History</h3>
            <button className="clear-hist-btn" onClick={() => setHistory([])} title="Clear history">
              <Trash2 size={15} />
            </button>
          </div>

          <div className="history-stack">
            {history.length === 0 ? (
              <p className="empty-hist">No past calculations in this session.</p>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="hist-item glass-card"
                  onClick={() => { setDisplay(item.expression); setResult(item.result); }}
                >
                  <span className="hist-expr">{item.expression}</span>
                  <span className="hist-res">= {item.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Embedded Calculator Styles */}
      <style>{`
        .calc-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calc-header { padding: 1.5rem; }

        .calc-workspace {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
        }

        .calc-unit {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .calc-display-screen {
          padding: 1.25rem;
          min-height: 90px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
        }

        .calc-expression {
          font-family: 'Outfit', monospace;
          font-size: 1.4rem;
          color: var(--text-primary);
          word-break: break-all;
        }

        .calc-result {
          font-family: 'Outfit', monospace;
          font-size: 1.1rem;
          color: var(--accent-cyan);
          font-weight: 700;
        }

        .calc-keypad-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .btn-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.6rem;
        }

        .calc-btn {
          height: 48px;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }

        .calc-btn:active { transform: scale(0.96); }

        .calc-btn.sci {
          font-size: 0.85rem;
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
        }

        .calc-btn.op {
          background: rgba(236, 72, 153, 0.15);
          color: #f472b6;
        }

        .calc-btn.danger {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .calc-btn.eval {
          grid-column: span 2;
          height: 48px;
        }

        .calc-history {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hist-icon { color: var(--accent-primary); }

        .clear-hist-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .history-stack {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          overflow-y: auto;
          max-height: 400px;
        }

        .hist-item {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          cursor: pointer;
        }

        .hist-expr { font-size: 0.85rem; color: var(--text-muted); }
        .hist-res { font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); }
        .empty-hist { font-size: 0.82rem; color: var(--text-muted); }

        @media (max-width: 900px) {
          .calc-workspace { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
