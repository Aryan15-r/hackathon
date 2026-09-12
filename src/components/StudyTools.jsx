import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  FileText,
  Plus,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function StudyTools() {
  const {
    pomodoroSeconds,
    setPomodoroSeconds,
    pomodoroIsRunning,
    setPomodoroIsRunning,
    pomodoroMode,
    setPomodoroMode,
    completedSessions
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('pomodoro'); // 'pomodoro' | 'flashcards' | 'quiz' | 'notes'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Flashcards State
  const [cards, setCards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardTopicInput, setFlashcardTopicInput] = useState('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // AI Quiz State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Notes State
  const [noteContent, setNoteContent] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Pomodoro Helpers
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (mode, seconds) => {
    setPomodoroIsRunning(false);
    setPomodoroMode(mode);
    setPomodoroSeconds(seconds);
  };

  // Generate Flashcards via AI
  const handleGenerateFlashcards = async (e) => {
    e.preventDefault();
    if (!flashcardTopicInput.trim() || isGeneratingFlashcards) return;

    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 study flashcards for topic "${flashcardTopicInput}". Format strictly as:\nQ1: [Question 1]\nA1: [Answer 1]\nQ2: [Question 2]\nA2: [Answer 2]\nQ3: [Question 3]\nA3: [Answer 3]`
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.text || '';
        const lines = text.split('\n').filter(l => l.trim());
        const extracted = [];
        let curQ = '', curA = '';
        lines.forEach(l => {
          if (l.toUpperCase().startsWith('Q')) {
            if (curQ && curA) extracted.push({ id: Date.now() + extracted.length, question: curQ, answer: curA });
            curQ = l.replace(/^Q\d*:\s*/i, '').trim();
            curA = '';
          } else if (l.toUpperCase().startsWith('A')) {
            curA = l.replace(/^A\d*:\s*/i, '').trim();
          }
        });
        if (curQ && curA) extracted.push({ id: Date.now() + extracted.length, question: curQ, answer: curA });

        if (extracted.length > 0) {
          setCards(extracted);
        } else {
          setCards([
            { id: Date.now() + 1, question: `What is the core principle of ${flashcardTopicInput}?`, answer: text.substring(0, 180) },
            { id: Date.now() + 2, question: `Key Application & Formula for ${flashcardTopicInput}`, answer: 'Refer to StudySpace AI tutor for step-by-step derivation.' }
          ]);
        }
        setCurrentCardIdx(0);
        setIsFlipped(false);
      }
    } catch (e) {
      alert('Flashcard generation timed out.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate Quiz via AI
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTopic.trim() || quizLoading) return;

    setQuizLoading(true);
    setQuizSubmitted(false);
    setUserAnswers({});

    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: quizTopic })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      }
    } catch (e) {
      alert('Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quizData || !quizData.questions) return 0;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  // Summarize Notes via AI
  const handleSummarizeNotes = async () => {
    if (!noteContent.trim() || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteContent, filename: 'Study Notes' })
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryResult(data.summary);
      }
    } catch (e) {
      setSummaryResult('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="study-tools-page animate-fade-in">
      {/* Sub-Navigation Tabs */}
      <div className="tools-subnav glass-card">
        <button
          className={`subnav-btn ${activeSubTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pomodoro')}
        >
          <Timer size={18} />
          <span>Pomodoro Timer</span>
        </button>

        <button
          className={`subnav-btn ${activeSubTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('flashcards')}
        >
          <BookOpen size={18} />
          <span>3D Flashcards</span>
        </button>

        <button
          className={`subnav-btn ${activeSubTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('quiz')}
        >
          <HelpCircle size={18} />
          <span>AI Quiz Generator</span>
        </button>

        <button
          className={`subnav-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('notes')}
        >
          <FileText size={18} />
          <span>Notes & Summarizer</span>
        </button>
      </div>

      {/* --- SUBTAB 1: POMODORO TIMER --- */}
      {activeSubTab === 'pomodoro' && (
        <div className="pomodoro-section glass-card animate-fade-in">
          <div className="pomo-mode-selector">
            <button
              className={`pomo-mode-btn ${pomodoroMode === 'work' ? 'active' : ''}`}
              onClick={() => handleModeChange('work', 1500)}
            >
              Focus Session (25m)
            </button>
            <button
              className={`pomo-mode-btn ${pomodoroMode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handleModeChange('shortBreak', 300)}
            >
              Short Break (5m)
            </button>
            <button
              className={`pomo-mode-btn ${pomodoroMode === 'longBreak' ? 'active' : ''}`}
              onClick={() => handleModeChange('longBreak', 900)}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Timer Radial Display */}
          <div className="timer-ring-container">
            <div className={`timer-ring ${pomodoroIsRunning ? 'pulse' : ''}`}>
              <span className="timer-digits">{formatTime(pomodoroSeconds)}</span>
              <span className="timer-label">{pomodoroMode === 'work' ? 'Deep Study Mode' : 'Rest & Refresh'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button
              className="pomo-control-btn main gradient-button"
              onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
            >
              {pomodoroIsRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{pomodoroIsRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              className="pomo-control-btn glass-card"
              onClick={() => {
                setPomodoroIsRunning(false);
                setPomodoroSeconds(pomodoroMode === 'work' ? 1500 : pomodoroMode === 'shortBreak' ? 300 : 900);
              }}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              className="pomo-control-btn glass-card"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title="Toggle Alert Sounds"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div className="session-counter-badge">
            <Award size={16} className="award-icon" />
            <span>Completed Today: <strong>{completedSessions} Pomodoro Cycles</strong></span>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: FLASHCARD STUDIO --- */}
      {activeSubTab === 'flashcards' && (
        <div className="flashcards-section animate-fade-in">
          {/* AI Flashcard Generator Bar */}
          <form onSubmit={handleGenerateFlashcards} className="flashcard-gen-bar glass-card">
            <Sparkles size={18} className="gen-icon" />
            <input
              type="text"
              placeholder="Enter subject topic to auto-generate AI flashcards (e.g. 'Database Normalization')"
              value={flashcardTopicInput}
              onChange={e => setFlashcardTopicInput(e.target.value)}
              className="gen-input"
            />
            <button type="submit" disabled={isGeneratingFlashcards} className="gradient-button">
              {isGeneratingFlashcards ? <RefreshCw size={16} className="spin-icon" /> : <Plus size={16} />}
              <span>Generate Cards</span>
            </button>
          </form>

          {/* 3D Flip Card Container */}
          {cards.length > 0 && (
            <div className="flashcard-viewer">
              <div
                className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="card-face front glass-card">
                  <span className="card-side-tag">QUESTION (Click to Flip)</span>
                  <h3 className="card-text">{cards[currentCardIdx].question}</h3>
                </div>

                <div className="card-face back glass-card">
                  <span className="card-side-tag answer">ANSWER</span>
                  <p className="card-text">{cards[currentCardIdx].answer}</p>
                </div>
              </div>

              {/* Navigation & Rating */}
              <div className="card-controls">
                <button
                  className="card-nav-btn glass-card"
                  disabled={currentCardIdx === 0}
                  onClick={() => { setCurrentCardIdx(prev => prev - 1); setIsFlipped(false); }}
                >
                  Previous
                </button>

                <span className="card-counter">
                  Card {currentCardIdx + 1} of {cards.length}
                </span>

                <button
                  className="card-nav-btn glass-card"
                  disabled={currentCardIdx === cards.length - 1}
                  onClick={() => { setCurrentCardIdx(prev => prev + 1); setIsFlipped(false); }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 3: AI QUIZ GENERATOR --- */}
      {activeSubTab === 'quiz' && (
        <div className="quiz-section glass-card animate-fade-in">
          <form onSubmit={handleGenerateQuiz} className="quiz-input-bar">
            <HelpCircle size={20} className="quiz-icon" />
            <input
              type="text"
              placeholder="Enter quiz topic (e.g. 'Data Structures Graph Algorithms')..."
              value={quizTopic}
              onChange={e => setQuizTopic(e.target.value)}
              className="quiz-input"
            />
            <button type="submit" disabled={quizLoading} className="gradient-button">
              {quizLoading ? <RefreshCw size={16} className="spin-icon" /> : <Sparkles size={16} />}
              <span>Generate Quiz</span>
            </button>
          </form>

          {/* Quiz Player */}
          {quizData && quizData.questions && (
            <div className="quiz-player">
              <div className="quiz-header-bar">
                <h3>Quiz: <span className="gradient-text">{quizData.topic}</span></h3>
                {quizSubmitted && (
                  <div className="quiz-score-badge">
                    Score: {calculateScore()} / {quizData.questions.length}
                  </div>
                )}
              </div>

              <div className="questions-list">
                {quizData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="question-item glass-card">
                    <h4 className="q-title">{qIdx + 1}. {q.question}</h4>
                    <div className="options-grid">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let optionClass = 'option-btn glass-card';
                        if (isSelected) optionClass += ' selected';
                        if (quizSubmitted) {
                          if (isCorrect) optionClass += ' correct';
                          else if (isSelected && !isCorrect) optionClass += ' wrong';
                        }

                        return (
                          <button
                            key={oIdx}
                            className={optionClass}
                            disabled={quizSubmitted}
                            onClick={() => setUserAnswers({ ...userAnswers, [qIdx]: oIdx })}
                          >
                            <span className="opt-letter">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="explanation-box">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  className="gradient-button submit-quiz-btn"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(userAnswers).length < quizData.questions.length}
                >
                  Submit Answers & View Score
                </button>
              ) : (
                <button className="gradient-button submit-quiz-btn" onClick={() => setQuizData(null)}>
                  Try Another Quiz
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 4: NOTES & SUMMARIZER --- */}
      {activeSubTab === 'notes' && (
        <div className="notes-section glass-card animate-fade-in">
          <div className="notes-grid">
            <div className="notes-editor-col">
              <div className="col-header">
                <h3>Markdown Study Notes</h3>
                <button className="gradient-button" onClick={handleSummarizeNotes} disabled={isSummarizing}>
                  {isSummarizing ? <RefreshCw size={16} className="spin-icon" /> : <Sparkles size={16} />}
                  <span>AI Summarize Notes</span>
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Type or paste lecture notes here..."
                className="notes-textarea glass-card"
                rows={14}
              />
            </div>

            <div className="notes-summary-col">
              <h3>AI Executive Summary</h3>
              <div className="summary-result-box glass-card">
                {summaryResult ? (
                  <div className="summary-text">
                    {summaryResult.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="placeholder-text">Click "AI Summarize Notes" to generate concise bullet points!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Study Tools Styles */}
      <style>{`
        .study-tools-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tools-subnav {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .subnav-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .subnav-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
          color: #818cf8;
        }

        .pomodoro-section {
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .pomo-mode-selector {
          display: flex;
          gap: 0.5rem;
          background: var(--input-bg);
          padding: 0.35rem;
          border-radius: var(--radius-full);
        }

        .pomo-mode-btn {
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .pomo-mode-btn.active {
          background: var(--accent-gradient);
          color: white;
        }

        .timer-ring-container {
          position: relative;
        }

        .timer-ring {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border: 4px solid var(--accent-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
        }

        .timer-digits {
          font-family: 'Outfit', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .timer-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pomo-control-btn.main {
          padding: 0.75rem 2rem;
          font-size: 1rem;
        }

        .pomo-control-btn.glass-card {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .session-counter-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--accent-cyan);
        }

        .flashcards-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .flashcard-gen-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
        }

        .gen-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
        }

        .gen-input:focus { outline: none; }

        .flashcard-viewer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .flashcard-3d {
          width: 100%;
          max-width: 520px;
          height: 280px;
          perspective: 1000px;
          cursor: pointer;
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: var(--radius-lg);
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-face.back {
          transform: rotateY(180deg);
          background: rgba(99, 102, 241, 0.15);
        }

        .flashcard-3d.flipped .card-face.front { transform: rotateY(-180deg); }
        .flashcard-3d.flipped .card-face.back { transform: rotateY(0deg); }

        .card-side-tag {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .card-side-tag.answer { color: var(--accent-cyan); }

        .card-text {
          font-size: 1.2rem;
          line-height: 1.5;
          text-align: center;
        }

        .card-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .card-nav-btn {
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .card-counter { font-size: 0.85rem; color: var(--text-muted); }

        .quiz-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .quiz-input-bar {
          display: flex;
          gap: 0.75rem;
        }

        .quiz-input {
          flex: 1;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
        }

        .quiz-input:focus { outline: none; border-color: var(--accent-primary); }

        .quiz-player {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .quiz-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quiz-score-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-green);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .question-item {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          text-align: left;
          cursor: pointer;
        }

        .option-btn.selected { border-color: var(--accent-primary); background: rgba(99, 102, 241, 0.2); }
        .option-btn.correct { border-color: var(--accent-green); background: rgba(16, 185, 129, 0.2); }
        .option-btn.wrong { border-color: var(--accent-red); background: rgba(239, 68, 68, 0.2); }

        .explanation-box {
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
        }

        .submit-quiz-btn {
          align-self: center;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .notes-editor-col, .notes-summary-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notes-textarea {
          width: 100%;
          padding: 1rem;
          color: var(--text-primary);
          font-family: 'Inter', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          resize: vertical;
        }

        .notes-textarea:focus { outline: none; border-color: var(--accent-primary); }

        .summary-result-box {
          min-height: 300px;
          padding: 1.25rem;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .placeholder-text { color: var(--text-muted); }

        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
