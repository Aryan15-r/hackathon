import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, Clock, Sparkles, BookOpen,
  Bell, Zap, LogOut, User, HelpCircle
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    setIsProfileModalOpen,
    totalFocusedSecondsToday,
    aiModelUsed,
    signOut,
    session,
  } = useApp();

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard':       return { title: 'Student Dashboard', icon: BookOpen };
      case 'ai-assistant':    return { title: 'AI Tutor', icon: Sparkles };
      case 'todo':            return { title: 'Tasks & Deadlines', icon: Clock };
      case 'community':       return { title: 'Peer Study Hub', icon: Zap };
      case 'study-tools':     return { title: 'Study Tools', icon: Clock };
      case 'pdf-tools':       return { title: 'PDF Studio', icon: BookOpen };
      case 'calculator':      return { title: 'Scientific Calculator', icon: Zap };
      case 'academic-search': return { title: 'Academic Search', icon: Search };
      default:                return { title: 'StudySpace', icon: BookOpen };
    }
  };

  const { title, icon: TabIcon } = getPageTitle(activeTab);
  const focusMins = Math.floor(totalFocusedSecondsToday / 60);
  const displayName = userProfile?.full_name || session?.user?.email?.split('@')[0] || 'You';
  const avatarUrl = userProfile?.avatar_url;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="navbar">
      {/* Left: page title */}
      <div className="navbar-left">
        <TabIcon size={20} style={{ color: 'rgba(255,255,255,0.75)' }} />
        <span className="navbar-page-title">{title}</span>
      </div>

      {/* Center: search trigger */}
      <div
        className="navbar-search-trigger"
        onClick={() => setActiveTab('academic-search')}
        title="Open Academic Search"
      >
        <Search size={15} />
        <span>Search textbooks, papers, algorithms...</span>
        <kbd>⌘K</kbd>
      </div>

      {/* Right: actions */}
      <div className="navbar-right">
        {/* Focus time pill */}
        {focusMins > 0 && (
          <div className="nav-focus-pill">
            <Clock size={14} />
            <span>{focusMins}m focus</span>
          </div>
        )}

        {/* AI status */}
        <div
          className="nav-ai-badge"
          onClick={() => setActiveTab('ai-assistant')}
          title="Open AI Tutor"
        >
          <span className="nav-status-dot" />
          <span>AI Active</span>
        </div>

        {/* Profile button */}
        <button className="navbar-user-btn" onClick={() => setIsProfileModalOpen(true)}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="navbar-avatar" />
          ) : (
            <div className="navbar-avatar-placeholder">{initials}</div>
          )}
          <span>{displayName.split(' ')[0]}</span>
        </button>

        {/* Help & Support Button */}
        <button
          className="navbar-icon-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('open-support-modal'))}
          title="Help & Support"
          aria-label="Open Help and Support"
        >
          <HelpCircle size={17} />
        </button>

        {/* Sign out */}
        <button className="navbar-icon-btn" onClick={signOut} title="Sign out" aria-label="Sign out">
          <LogOut size={17} />
        </button>
      </div>

      <style>{`
        .navbar-search-trigger {
          flex: 1;
          max-width: 440px;
          height: 36px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 0.85rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50px;
          cursor: pointer;
          color: rgba(255,255,255,0.65);
          font-size: 0.83rem;
          transition: all 0.2s;
        }
        .navbar-search-trigger:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.9);
        }
        .navbar-search-trigger span { flex: 1; }
        .navbar-search-trigger kbd {
          font-size: 0.68rem;
          background: rgba(255,255,255,0.15);
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
        .nav-focus-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 50px;
          padding: 0.35rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }
        .nav-ai-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(5,150,105,0.2);
          border: 1px solid rgba(5,150,105,0.35);
          border-radius: 50px;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #6EE7B7;
          cursor: pointer;
        }
        .nav-status-dot {
          width: 7px; height: 7px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 6px #10B981;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
        }
        @media (max-width: 900px) {
          .navbar-search-trigger { display: none; }
          .nav-focus-pill { display: none; }
        }
      `}</style>
    </header>
  );
}
