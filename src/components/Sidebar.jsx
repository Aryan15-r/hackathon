import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Bot, CheckSquare, MessageSquare,
  Timer, FileText, Calculator, Search,
  GraduationCap, Sparkles, ChevronRight, LogOut, UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, userProfile, setIsProfileModalOpen, tasks, signOut, session } = useApp();

  const pendingCount = tasks.filter(t => !t.completed).length;
  const displayName = userProfile?.full_name || session?.user?.email?.split('@')[0] || 'Student';
  const email = session?.user?.email || '';
  const avatarUrl = userProfile?.avatar_url;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    { id: 'dashboard',       label: 'Dashboard',            icon: LayoutDashboard },
    { id: 'ai-assistant',    label: 'AI Assistant',         icon: Bot,            badge: 'Gemini' },
    { id: 'todo',            label: 'Tasks & Exams',        icon: CheckSquare,    badge: pendingCount > 0 ? pendingCount : null },
    { id: 'attendance',      label: 'Attendance & Tracker', icon: UserCheck,      badge: '75%' },
    { id: 'community',       label: 'Community Hub',        icon: MessageSquare,  badge: 'Live' },
    { id: 'study-tools',     label: 'Study Tools',          icon: Timer },
    { id: 'pdf-tools',       label: 'PDF Studio',           icon: FileText },
    { id: 'calculator',      label: 'Scientific Calc',      icon: Calculator },
    { id: 'academic-search', label: 'Academic Search',      icon: Search },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="sidebar-brand">StudySpace</div>
          <div className="sidebar-tagline">Student Workspace</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            className={`sidebar-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <div className="sidebar-item-icon">
              <Icon size={19} />
            </div>
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            {badge && (
              <span className="sidebar-badge">{badge}</span>
            )}
          </button>
        ))}

        {/* AI Prompt Banner */}
        <div className="sidebar-section-label" style={{ marginTop: '0.5rem' }}>Quick Access</div>
        <button
          className="sidebar-ai-banner"
          onClick={() => setActiveTab('ai-assistant')}
        >
          <Sparkles size={15} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', marginBottom: 2 }}>Ask AI Tutor</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.3 }}>Gemini cascade • LaTeX math</div>
          </div>
          <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-card" onClick={() => setIsProfileModalOpen(true)}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-email">{email}</div>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.18);
          padding: 0.1rem 0.45rem;
          border-radius: 50px;
          white-space: nowrap;
        }
        .sidebar-ai-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          background: rgba(217,119,6,0.2);
          border: 1px solid rgba(217,119,6,0.3);
          cursor: pointer;
          transition: all 0.2s;
          color: #FCD34D;
          margin-top: 0.1rem;
          width: 100%;
        }
        .sidebar-ai-banner:hover {
          background: rgba(217,119,6,0.3);
        }
      `}</style>
    </aside>
  );
}
