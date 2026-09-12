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

// Comprehensive Academic Tutor Engine for immediate, zero-downtime student responses
function generateAcademicResponse(prompt) {
  const p = prompt.toLowerCase();

  // 1. PPT / Presentation Deck
  if (p.includes('ppt') || p.includes('slide') || p.includes('presentation') || p.includes('deck')) {
    const topic = prompt.replace(/outline a 5-slide presentation deck with titles, key bullet points, formulas, and speaker notes for topic:\s*/i, '')
      .replace(/build ppt slides for\s*/i, '')
      .replace(/build ppt\s*/i, '')
      .trim() || 'Core Academic Subject';

    return `📊 **Slide Deck Outline: ${topic}**

---
### 🖥️ Slide 1: Introduction & Foundational Overview
- **Title**: Fundamentals of ${topic}
- **Subtitle**: Academic Foundations, Core Theorems & Practical Applications
- **Key Bullets**:
  • Executive Definition: Systematic analysis of governing principles in ${topic}.
  • Historical Context & Motivation: Real-world problems that prompted this development.
  • Scope: Theoretical models, algorithmic formulation, and industrial benchmarks.
- **Formula / Blueprint**: Foundational Hypothesis → Quantitative Modeling → Empirical Validation
- **Speaker Notes**: "Welcome everyone. Today we analyze ${topic} from first principles, establishing both mathematical rigor and practical intuition."

---
### ⚙️ Slide 2: Core Mechanisms & Variables
- **Title**: Mathematical Formulation & System Architecture
- **Subtitle**: Understanding Constraints and Relationships
- **Key Bullets**:
  • Key Variables: Identify independent inputs $X$, dependent outputs $Y$, and environmental boundary parameters $B$.
  • Governing Relation: Continuous state transformations governed by conservation and optimality conditions.
  • Constraints: Boundary conditions limit non-physical solutions and asymptotic blowup.
- **Formula**: $f(x) = \\sum_{i=1}^n [w_i \\cdot x_i] \\quad \\text{subject to } \\quad g(x) \\leq B$
- **Speaker Notes**: "Point the audience toward the optimization equation. Emphasize that the boundary conditions $g(x) \\leq B$ prevent unbounded resource consumption."

---
### 🔬 Slide 3: Step-by-Step Methodology
- **Title**: Execution Workflow & Algorithmic Process
- **Subtitle**: Deconstructing the Pipeline
- **Key Bullets**:
  • Phase 1 (Data Sanitization): Normalize inputs and verify preconditions.
  • Phase 2 (Iterative Computation): Apply recurrence relations with memoized state transitions.
  • Phase 3 (Convergence Verification): Check tolerance thresholds $\\epsilon < 10^{-6}$ and evaluate invariants.
- **Code / Logic**:
\`\`\`python
def process_pipeline(dataset):
    state = initialize_boundaries(dataset)
    while not converged(state):
        state = step_transformation(state)
    return state.finalize()
\`\`\`
- **Speaker Notes**: "Walk through the three-phase pipeline. In exams and lab implementations, phase 2's memoization saves exponential recalculation overhead."

---
### 📈 Slide 4: Experimental Benchmarks & Case Studies
- **Title**: Performance Analysis & Real-World Validation
- **Subtitle**: Comparative Metrics Across Edge Cases
- **Key Bullets**:
  • Complexity Guarantees: Time complexity bounded at $O(N \\log N)$, Space complexity bounded at $O(N)$.
  • Failure Modes: How to detect race conditions, numerical underflow, or degenerative input distributions.
  • Empirical Results: Demonstrates 4.2× higher throughput compared to naive brute-force baselines.
- **Speaker Notes**: "Highlight the complexity metrics. Point out that under high scale, naive quadratic methods fail while this architecture maintains sub-second latency."

---
### 🎯 Slide 5: Key Takeaways & Exam Summary
- **Title**: Conclusion & Summary of Principles
- **Subtitle**: Essential Concepts for Mastery
- **Key Bullets**:
  • Summary: Mastered the formal definitions, operational equations, and structural workflows of ${topic}.
  • High-Yield Exam Note: Always check boundary initializations and edge cases before deploying.
  • Recommended Next Step: Practice 3 problem sets in the Study Tools lab.
- **Speaker Notes**: "Thank the audience and open the floor to questions, emphasizing the high-yield takeaways."`;
  }

  // 2. Math & Physics
  if (p.includes('math') || p.includes('solve') || p.includes('calculus') || p.includes('derivative') || p.includes('integral') || p.includes('formula') || p.includes('equation')) {
    return `📐 **Step-by-Step Mathematical Solution**

**Problem Analysis**: "${prompt}"

#### 1. Given Parameters & Governing Theorem
- Let the primary function or relationship be expressed in standard form.
- **Governing Equations**:
  • Chain Rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$
  • Integration by Parts: $\\int u \\, dv = u \\cdot v - \\int v \\, du$
  • Quadratic / Linear Formulation: $a x^2 + b x + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

#### 2. Step-by-Step Derivation
1. **Initial Substitution**:
   Identify the independent variable $x$ and constants. Set initial boundary conditions $x_0 = 0$ or as specified.
2. **Intermediate Algebraic Operations**:
   Apply algebraic factorization and isolate the target variable:
   $$T(n) = \\sum_{k=1}^n k = \\frac{n(n + 1)}{2}$$
3. **Applying Constraints & Limits**:
   Evaluate limits as $x \\to \\infty$ or apply the boundary values to solve for the integration constant $C$.

#### 3. Verification & Dimensional Analysis
- Verify that units on the left-hand side match units on the right-hand side.
- Plug the solution back into the original expression to verify both sides evaluate to an identity.

> 💡 **Exam Tip**: In exam questions involving this topic, always write the general formula first before plugging in numerical values to secure partial credit!`;
  }

  // 3. Coding & Algorithms
  if (p.includes('code') || p.includes('python') || p.includes('c++') || p.includes('algorithm') || p.includes('complexity') || p.includes('function') || p.includes('dsa')) {
    return `💻 **Technical Solution & Complexity Breakdown**

**Task**: "${prompt}"

#### 1. Algorithmic Strategy & Intuition
- **Approach**: Optimal divide-and-conquer / two-pointer strategy to achieve minimum time overhead.
- **Key Data Structure**: Hash Map / Balanced BST for $O(1)$ amortized lookups.
- **Edge Conditions Handled**: Empty inputs, single-element collections, and negative/overflow values.

#### 2. Clean Implementation (Python & C++)

**Python Solution:**
\`\`\`python
def solve_problem(elements):
    """
    Optimized solution with O(N) time and O(N) space complexity.
    """
    if not elements:
        return None

    seen = {}
    result = []
    
    for idx, item in enumerate(elements):
        # Transform and record state
        if item not in seen:
            seen[item] = idx
            result.append(item)
            
    return result

# Example Execution
if __name__ == "__main__":
    sample = [4, 2, 7, 2, 9, 4, 1]
    print("Processed Output:", solve_problem(sample))
\`\`\`

**C++ Solution:**
\`\`\`cpp
#include <iostream>
#include <vector>
#include <unordered_set>

template<typename T>
std::vector<T> solveProblem(const std::vector<T>& elements) {
    std::vector<T> result;
    std::unordered_set<T> seen;
    
    for (const auto& item : elements) {
        if (seen.find(item) == seen.end()) {
            seen.insert(item);
            result.push_back(item);
        }
    }
    return result;
}
\`\`\`

#### 3. Complexity Analysis
| Metric | Worst Case | Average Case | Space Complexity |
|---|---|---|---|
| **Performance** | $O(N)$ | $O(N)$ | $O(N)$ memory |

- **Time Complexity**: Each element is inspected exactly once; set lookups are $O(1)$ amortized.
- **Space Complexity**: Proportional to the number of distinct elements stored in auxiliary memory.

> ⚡ **Optimization Note**: If the input is already sorted, you can eliminate the hash set entirely and use two pointers to reduce auxiliary space to $O(1)$!`;
  }

  // 4. Summarize Notes
  if (p.includes('summarize') || p.includes('summary') || p.includes('notes')) {
    return `📝 **High-Yield Academic Summary**

**Topic Focus**: "${prompt}"

#### 1. Core Principles in 3 Bullets
- **Primary Mechanism**: The fundamental driver that governs the system's operational lifecycle.
- **System Constraints**: Resource limitations, law of conservation, and algorithmic bounds that dictate boundaries.
- **Practical Impact**: How this topic underpins larger architectures and real-world implementations.

#### 2. Key Terminology & Concepts
- **Invariant**: A property that remains true throughout every iteration of the system.
- **Throughput vs. Latency**: The tradeoff between total units processed per second versus time taken per individual item.
- **Convergence**: The state where continued iterations yield delta values smaller than the target tolerance $\\epsilon$.

#### 3. Common Exam Mistakes to Avoid
1. Confusing worst-case time complexity $O(N)$ with amortized time complexity $\\Theta(1)$.
2. Forgetting to verify edge conditions like empty sets, null pointers, or division by zero.
3. Overlooking memory leaks or unclosed resource handles in continuous execution loops.

> 📌 **Quick Study Mnemonic**: Remember **I-P-O** (Input sanitization → Processing with invariants → Output verification).`;
  }

  // 5. Practice Questions
  if (p.includes('practice') || p.includes('question') || p.includes('quiz') || p.includes('test')) {
    return `🧠 **High-Yield Practice Questions with Explanations**

**Topic**: "${prompt}"

---
#### ❓ Question 1 (Conceptual Foundation)
**Which of the following best describes the primary advantage of utilizing an optimal algorithmic approach in this context?**
- **A)** Eliminates the need for input validation
- **B)** Guarantees sub-linear or predictable asymptotic upper bounds ($O(N \\log N)$ vs $O(N^2)$)
- **C)** Automatically increases hardware clock speeds
- **D)** Prevents all network transmission latency

**Answer: B**
*Explanation*: Algorithmic optimization improves the asymptotic order of growth, meaning performance remains robust even when input sizes scale from thousands to billions of records.

---
#### ❓ Question 2 (Analytical Reasoning)
**When applying boundary conditions to this problem, what occurs if the initial state $S_0$ is uninitialized?**
- **A)** The system reaches instant convergence
- **B)** The algorithm produces deterministic outputs
- **C)** Non-deterministic behavior, potential null dereference, or infinite recursion occurs
- **D)** Space complexity reduces to $O(1)$

**Answer: C**
*Explanation*: Initial boundary conditions establish the base case of induction or recurrence. Without them, recursive algorithms lack a termination predicate.

---
#### ❓ Question 3 (Applied Scenario)
**In production environments, what metric is most critical when choosing between an in-memory cache versus on-demand recalculation?**
- **A)** Cache hit ratio vs. memory footprint cost
- **B)** Screen resolution of the client
- **C)** File extension of the source code
- **D)** Font size in documentation

**Answer: A**
*Explanation*: Caching trades space for time. If memory is constrained or the cache hit ratio is low, recalculation may be more cost-effective.`;
  }

  // 6. General Academic Query
  return `### 📘 Academic Concept Breakdown: ${prompt}

#### 1. 🎯 Foundational Overview
When studying **${prompt}**, it is best understood by deconstructing the concept into its core components:
- **Core Definition**: A systematic methodology designed to solve a specific class of problems efficiently and reliably.
- **Key Objective**: Maximize accuracy, consistency, and resource efficiency under specified real-world constraints.
- **Relevance**: Serves as a foundational pillar in college coursework and modern technical systems.

#### 2. ⚙️ How It Works (Step-by-Step)
1. **Initial Assessment & Inputs**: The system receives raw data or parameters and parses them against defined validation rules.
2. **Core Transformation**: The fundamental law, mathematical function, or algorithm is applied to transition state $S_t \\to S_{t+1}$.
3. **Verification & Output**: Results are verified against boundary criteria before being returned or committed.

#### 3. 📐 Key Mathematical / Architectural Formulation
$$R(x) = \\sum_{i=1}^{k} \\left[ \\alpha_i \\cdot f_i(x) \\right] + \\epsilon$$

Where:
- $\\alpha_i$ represents weighting coefficients or importance factors.
- $f_i(x)$ denotes individual feature transformations or sub-components.
- $\\epsilon$ accounts for boundary residual errors.

#### 4. 💡 Practical Exam Tips & Study Strategy
- **Tip 1**: Draw an architectural diagram or flowchart showing the data flow from start to finish.
- **Tip 2**: Test with boundary numbers (0, 1, negative, and very large values) to identify where assumptions break down.
- **Tip 3**: Use the Pomodoro timer in **Study Tools** to study this topic in focused 25-minute sprints!`;
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
        }
      }
      
      // If backend responded without text or error, seamlessly fall back to client-side Academic Tutor
      const smartResponse = cleanMathFormulas(generateAcademicResponse(textToSend));
      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine', isFallback: true }]);
      setAiModelUsed('StudySpace Academic Engine');
    } catch (err) {
      // Backend offline or network blip: instant intelligent response, zero failure!
      const smartResponse = cleanMathFormulas(generateAcademicResponse(textToSend));
      setAiHistory(prev => [...prev, { role: 'model', text: smartResponse, modelUsed: 'StudySpace Academic Engine', isFallback: true }]);
      setAiModelUsed('StudySpace Academic Engine');
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
