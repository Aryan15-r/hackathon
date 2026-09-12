import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Sun,
  Moon,
  Zap,
  Bell,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    userProfile,
    setIsProfileModalOpen,
    totalFocusedSecondsToday,
    aiModelUsed
  } = useApp();

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return { title: 'Student Overview', icon: BookOpen };
      case 'ai-assistant': return { title: 'StudySpace AI Tutor', icon: Sparkles };
      case 'todo': return { title: 'Task & Deadline Planner', icon: Clock };
      case 'community': return { title: 'Peer Study Hub', icon: Zap };
      case 'study-tools': return { title: 'Focus & Study Tools', icon: Clock };
      case 'pdf-tools': return { title: 'PDF & Document Studio', icon: BookOpen };
      case 'calculator': return { title: 'Scientific Calculator', icon: Zap };
      case 'academic-search': return { title: 'Smart Academic Search', icon: Search };
      default: return { title: 'Workspace', icon: BookOpen };
    }
  };

  const currentTabInfo = getPageTitle(activeTab);
  const TabIcon = currentTabInfo.icon;

  const focusMinutesToday = Math.floor(totalFocusedSecondsToday / 60);

  return (
    <header className="navbar-container">
      {/* Page Title & Breadcrumb */}
      <div className="navbar-title-section">
        <TabIcon size={22} className="navbar-title-icon" />
        <h1 className="navbar-title">{currentTabInfo.title}</h1>
      </div>

      {/* Global Academic Search Bar Trigger */}
      <div className="navbar-search-bar glass-card" onClick={() => setActiveTab('academic-search')}>
        <Search size={16} className="search-icon" />
        <span className="search-placeholder">Search textbooks, past papers, algorithms, or formulas...</span>
        <kbd className="search-kbd">⌘K</kbd>
      </div>

      {/* Action Indicators */}
      <div className="navbar-actions">
        {/* Focus Time Pill */}
        <div className="focus-pill glass-card" title="Focus time logged today">
          <Clock size={15} className="focus-icon" />
          <span>{focusMinutesToday} mins focus</span>
        </div>

        {/* Zero-Downtime Cascade Indicator */}
        <div className="ai-status-badge glass-card" onClick={() => setActiveTab('ai-assistant')}>
          <div className="status-dot"></div>
          <span className="ai-status-text">AI: {aiModelUsed}</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn glass-card"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} className="theme-icon" /> : <Moon size={18} className="theme-icon" />}
        </button>

        {/* Profile Avatar Badge */}
        <div
          className="navbar-profile-badge glass-card"
          onClick={() => setIsProfileModalOpen(true)}
          title="Edit Profile"
        >
          <img src={userProfile.avatarUrl} alt={userProfile.fullName} className="profile-img" />
          <span className="profile-name">{userProfile.fullName.split(' ')[0]}</span>
        </div>
      </div>

      {/* Embedded Styles */}
      <style>{`
        .navbar-container {
          height: 70px;
          background: var(--navbar-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .navbar-title-section {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 220px;
        }

        .navbar-title-icon {
          color: var(--accent-primary);
        }

        .navbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .navbar-search-bar {
          flex: 1;
          max-width: 480px;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 0.85rem;
          gap: 0.6rem;
          cursor: pointer;
          border-radius: var(--radius-full);
          background: var(--input-bg);
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .navbar-search-bar:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
        }

        .search-placeholder {
          font-size: 0.85rem;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-kbd {
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .focus-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-cyan);
          border-radius: var(--radius-full);
        }

        .focus-icon {
          color: var(--accent-cyan);
        }

        .ai-status-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: #a5b4fc;
          cursor: pointer;
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .theme-toggle-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          cursor: pointer;
          color: var(--text-primary);
        }

        .theme-toggle-btn:hover {
          color: var(--accent-primary);
        }

        .navbar-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.7rem 0.3rem 0.3rem;
          border-radius: var(--radius-full);
          cursor: pointer;
        }

        .profile-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .navbar-search-bar {
            display: none;
          }
          .focus-pill {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
