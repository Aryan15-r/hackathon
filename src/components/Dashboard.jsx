import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  MessageSquare,
  ArrowRight,
  Plus,
  Timer,
  FileText,
  Calculator,
  Search,
  BookOpen,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const {
    userProfile,
    setActiveTab,
    tasks,
    toggleTask,
    totalFocusedSecondsToday,
    completedSessions,
    messages,
    setAiHistory
  } = useApp();

  const [quickPrompt, setQuickPrompt] = useState('');

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const focusMinutes = Math.floor(totalFocusedSecondsToday / 60);

  const handleQuickAiSubmit = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    setAiHistory(prev => [
      ...prev,
      { role: 'user', text: quickPrompt }
    ]);
    setActiveTab('ai-assistant');
  };

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-card">
        <div className="banner-content">
          <span className="banner-badge">STUDENT DASHBOARD</span>
          <h1 className="banner-greeting">
            Welcome back, <span className="gradient-text">{userProfile?.full_name || 'Student'}</span> 👋
          </h1>
          <p className="banner-subtext">
            {userProfile?.college ? `${userProfile.college}` : 'Update your profile to add your college'}
            {userProfile?.branch ? ` • ${userProfile.branch}` : ''}
            {userProfile?.year ? ` (Year ${userProfile.year})` : ''}
          </p>
        </div>

        {/* Pomodoro sessions today */}
        <div className="streak-badge glass-card">
          <Flame size={24} className="streak-icon" />
          <div className="streak-info">
            <span className="streak-count">{completedSessions} Sessions</span>
            <span className="streak-label">Focus Today 🔥</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper focus">
            <Clock size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{focusMinutes} <span className="unit">mins</span></span>
            <span className="metric-label">Focus Logged Today</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper tasks">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{completedTasksCount} / {tasks.length}</span>
            <span className="metric-label">Tasks Completed</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper sessions">
            <Timer size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{completedSessions}</span>
            <span className="metric-label">Pomodoro Cycles</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper community">
            <MessageSquare size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{messages.length}</span>
            <span className="metric-label">Channel Discussions</span>
          </div>
        </div>
      </div>

      {/* Quick AI Prompt Box */}
      <div className="quick-ai-box glass-card">
        <div className="ai-box-header">
          <Sparkles size={20} className="ai-sparkle" />
          <div className="ai-box-titles">
            <h3>Ask StudySpace AI Tutor</h3>
            <span>Zero-Downtime Gemini AI Cascade • Instant Math & Code Solutions</span>
          </div>
        </div>

        <form onSubmit={handleQuickAiSubmit} className="ai-input-form">
          <input
            type="text"
            placeholder="Ask any question... (e.g. 'Explain Dijkstra shortest path algorithm with example')"
            value={quickPrompt}
            onChange={e => setQuickPrompt(e.target.value)}
            className="quick-ai-input"
          />
          <button type="submit" className="gradient-button">
            <span>Solve</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* Main Grid Section */}
      <div className="dashboard-grid">
        {/* Left Column: Deadlines & Tasks */}
        <div className="dashboard-column">
          <div className="section-card glass-card">
            <div className="section-header">
              <div className="section-title">
                <AlertCircle size={18} className="title-icon" />
                <h3>Upcoming Deadlines & Tasks</h3>
              </div>
              <button className="text-link-btn" onClick={() => setActiveTab('todo')}>
                View All ({pendingTasks.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="task-list">
              {pendingTasks.length === 0 ? (
                <div className="empty-tasks">
                  <CheckCircle2 size={32} className="empty-icon" />
                  <p>All caught up! No pending deadlines today.</p>
                </div>
              ) : (
                pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="dash-task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <div className="task-details">
                      <span className="task-title">{task.title}</span>
                      <div className="task-meta">
                        <span className={`category-tag ${task.category}`}>{task.category}</span>
                        <span className={`priority-tag ${task.priority}`}>{task.priority} priority</span>
                        <span className="due-date">Due: {task.due_date} {task.due_time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Utility Launchers Grid */}
          <div className="utilities-section">
            <h3 className="section-subtitle">Quick Productivity Utilities</h3>
            <div className="utilities-grid">
              <div className="utility-card glass-card glass-card-interactive" onClick={() => setActiveTab('study-tools')}>
                <Timer size={24} className="utility-icon focus" />
                <h4>Focus Pomodoro</h4>
                <p>25m / 5m customizable study cycles</p>
              </div>

              <div className="utility-card glass-card glass-card-interactive" onClick={() => setActiveTab('pdf-tools')}>
                <FileText size={24} className="utility-icon pdf" />
                <h4>PDF & Doc Studio</h4>
                <p>View, extract text & summarize PDFs</p>
              </div>

              <div className="utility-card glass-card glass-card-interactive" onClick={() => setActiveTab('calculator')}>
                <Calculator size={24} className="utility-icon calc" />
                <h4>Scientific Calc</h4>
                <p>Full trig, log & math memory engine</p>
              </div>

              <div className="utility-card glass-card glass-card-interactive" onClick={() => setActiveTab('academic-search')}>
                <Search size={24} className="utility-icon search" />
                <h4>Academic Search</h4>
                <p>Find textbooks, notes & slides</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Community Feed Preview & Study Shortcuts */}
        <div className="dashboard-column">
          <div className="section-card glass-card">
            <div className="section-header">
              <div className="section-title">
                <MessageSquare size={18} className="title-icon" />
                <h3>Recent Community Discussions</h3>
              </div>
              <button className="text-link-btn" onClick={() => setActiveTab('community')}>
                Join Hub <ChevronRight size={14} />
              </button>
            </div>

            <div className="community-feed">
              {messages.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <span className="empty-state-icon">💬</span>
                  <p style={{ fontSize: '0.85rem' }}>No discussions yet. Be the first!</p>
                </div>
              ) : (
                messages.slice(-3).map(msg => {
                  const author = msg.profiles?.full_name || 'Student';
                  const av = msg.profiles?.avatar_url;
                  const initials = author.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                  const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div key={msg.id} className="feed-message-item">
                      {av ? (
                        <img src={av} alt={author} className="feed-avatar" />
                      ) : (
                        <div className="feed-avatar" style={{ background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', borderRadius: '50%', flexShrink: 0 }}>{initials}</div>
                      )}
                      <div className="feed-msg-content">
                        <div className="feed-user-meta">
                          <span className="feed-author">{author}</span>
                          <span className="feed-time">{ts}</span>
                        </div>
                        <p className="feed-text">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Tutor Features Card */}
          <div className="ai-feature-card glass-card">
            <div className="ai-card-content">
              <span className="ai-card-badge">GEMINI CASCADE ENGINE</span>
              <h3>Zero Response Truncation</h3>
              <p>Supports up to 16,384 output tokens per response with automatic failover between Gemini 3.6, 3.7, 3.5, and Flash Lite.</p>
              <button className="gradient-button" onClick={() => setActiveTab('ai-assistant')}>
                <Sparkles size={16} /> Open AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Dashboard Styles */}
      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem 2.25rem;
          background: linear-gradient(135deg, rgba(30, 58, 95, 0.06) 0%, rgba(217, 119, 6, 0.05) 100%);
          border-color: rgba(30, 58, 95, 0.12);
        }

        .banner-badge {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--navy);
          margin-bottom: 0.35rem;
          display: block;
          opacity: 0.7;
        }

        .banner-greeting {
          font-size: 1.85rem;
          margin-bottom: 0.35rem;
        }

        .banner-subtext {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.25rem;
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .streak-icon {
          color: #f59e0b;
        }

        .streak-count {
          font-family: 'Outfit', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #f59e0b;
          display: block;
          line-height: 1.1;
        }

        .streak-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .metric-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon-wrapper.focus { background: rgba(30, 58, 95, 0.1); color: #1E3A5F; }
        .metric-icon-wrapper.tasks { background: rgba(5, 150, 105, 0.12); color: #059669; }
        .metric-icon-wrapper.sessions { background: rgba(217, 119, 6, 0.12); color: #D97706; }
        .metric-icon-wrapper.community { background: rgba(37, 99, 235, 0.1); color: #2563EB; }

        .metric-data {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .metric-value .unit {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .metric-label {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .quick-ai-box {
          padding: 1.5rem;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent), var(--card-bg);
        }

        .ai-box-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .ai-sparkle {
          color: #818cf8;
        }

        .ai-box-titles h3 {
          font-size: 1.1rem;
        }

        .ai-box-titles span {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .ai-input-form {
          display: flex;
          gap: 0.75rem;
        }

        .quick-ai-input {
          flex: 1;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
        }

        .quick-ai-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .dashboard-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-card {
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .title-icon {
          color: var(--accent-primary);
        }

        .text-link-btn {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .dash-task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-muted);
          border-radius: var(--radius-sm);
          border: 1px solid var(--card-border);
        }

        .task-checkbox {
          margin-top: 0.2rem;
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: var(--accent-primary);
        }

        .task-details {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .task-title {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: rgba(30, 58, 95, 0.1);
          color: #1E3A5F;
        }

        .priority-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .priority-tag.high { background: rgba(220, 38, 38, 0.1); color: #991B1B; }
        .priority-tag.medium { background: rgba(217, 119, 6, 0.1); color: #92400E; }

        .due-date {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .utilities-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .utilities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .utility-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
        }

        .utility-icon.focus { color: #06b6d4; }
        .utility-icon.pdf { color: #ec4899; }
        .utility-icon.calc { color: #f59e0b; }
        .utility-icon.search { color: #10b981; }

        .utility-card h4 {
          font-size: 0.95rem;
        }

        .utility-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .community-feed {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .feed-message-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-muted);
          border-radius: var(--radius-sm);
        }

        .feed-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .feed-msg-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .feed-user-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feed-author {
          font-size: 0.82rem;
          font-weight: 600;
        }

        .feed-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .feed-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .ai-feature-card {
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(30, 58, 95, 0.08) 0%, rgba(217, 119, 6, 0.06) 100%);
          border-color: rgba(30, 58, 95, 0.15);
        }

        .ai-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ai-card-badge {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--navy);
          opacity: 0.7;
        }

        .empty-tasks {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem;
          color: var(--text-muted);
        }

        .empty-icon {
          color: var(--accent-green);
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
