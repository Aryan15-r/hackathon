import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  MessageSquare,
  Timer,
  FileText,
  Calculator,
  Search,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, userProfile, setIsProfileModalOpen, tasks } = useApp();

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'Cascade 3.6', badgeColor: '#6366f1' },
    { id: 'todo', label: 'Tasks & Exams', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null, badgeColor: '#ec4899' },
    { id: 'community', label: 'Community Hub', icon: MessageSquare, badge: 'Live', badgeColor: '#10b981' },
    { id: 'study-tools', label: 'Study Tools', icon: Timer, badge: null },
    { id: 'pdf-tools', label: 'PDF & Doc Studio', icon: FileText, badge: null },
    { id: 'calculator', label: 'Scientific Calc', icon: Calculator, badge: null },
    { id: 'academic-search', label: 'Academic Search', icon: Search, badge: null },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon-wrapper">
          <GraduationCap size={28} className="brand-icon" />
        </div>
        <div className="brand-titles">
          <span className="brand-title">Study<span className="gradient-text">Space</span></span>
          <span className="brand-subtitle">Student OS v1.0</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <div className="menu-section-label">WORKSPACE</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-item-left">
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="nav-badge"
                  style={{ backgroundColor: item.badgeColor || 'var(--accent-primary)' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick AI Pro Prompt Banner */}
      <div className="sidebar-pro-banner glass-card" onClick={() => setActiveTab('ai-assistant')}>
        <div className="pro-banner-header">
          <Sparkles size={16} className="pro-icon" />
          <span>Zero-Downtime AI</span>
        </div>
        <p className="pro-banner-text">16,384 token capacity & instant LaTeX math solving.</p>
        <div className="pro-banner-action">
          <span>Ask Doubt</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* User Profile Card Footer */}
      <div className="user-footer glass-card" onClick={() => setIsProfileModalOpen(true)}>
        <img
          src={userProfile.avatarUrl}
          alt={userProfile.fullName}
          className="user-avatar"
        />
        <div className="user-info">
          <span className="user-name">{userProfile.fullName}</span>
          <span className="user-college">{userProfile.branch.split(' ')[0]} • Year {userProfile.year}</span>
        </div>
        <ShieldCheck size={16} className="user-settings-icon" />
      </div>

      {/* Embedded Styles for Sidebar */}
      <style>{`
        .sidebar-container {
          width: 280px;
          height: 100vh;
          background: var(--sidebar-bg);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          user-select: none;
          z-index: 20;
          flex-shrink: 0;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem 1.5rem;
          border-bottom: 1px solid var(--card-border);
          margin-bottom: 1.25rem;
        }

        .brand-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }

        .brand-titles {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.35rem;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          overflow-y: auto;
        }

        .menu-section-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 0.5rem 0.75rem 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.3);
          color: #818cf8;
          font-weight: 600;
        }

        .nav-item-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-icon {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-item.active .nav-icon {
          color: #818cf8;
        }

        .nav-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          line-height: 1.2;
        }

        .sidebar-pro-banner {
          margin: 1rem 0;
          padding: 0.85rem;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .pro-banner-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #a5b4fc;
          margin-bottom: 0.25rem;
        }

        .pro-banner-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .pro-banner-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-primary);
        }

        .user-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          cursor: pointer;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 2px solid var(--accent-primary);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-college {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-settings-icon {
          color: var(--accent-green);
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--card-border);
            padding: 1rem;
          }
          .nav-menu {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
          .nav-item {
            white-space: nowrap;
          }
          .sidebar-pro-banner {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
