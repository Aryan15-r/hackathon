import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';

import Dashboard from './components/Dashboard';
import AiAssistant from './components/AiAssistant';
import TaskPlanner from './components/TaskPlanner';
import CommunityChannels from './components/CommunityChannels';
import StudyTools from './components/StudyTools';
import PdfTools from './components/PdfTools';
import Calculator from './components/Calculator';
import AcademicSearch from './components/AcademicSearch';

function MainAppContent() {
  const { session, authLoading, activeTab } = useApp();

  // Loading splash while Supabase resolves session
  if (authLoading) {
    return (
      <div className="auth-splash">
        <div className="splash-logo">📚</div>
        <div className="splash-text">StudySpace</div>
        <div className="splash-spinner" />
        <style>{`
          .auth-splash {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            background: #FDF6EC;
          }
          .splash-logo {
            font-size: 3rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .splash-text {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            color: #1E3A5F;
          }
          .splash-spinner {
            width: 32px; height: 32px;
            border: 3px solid #E5E7EB;
            border-top-color: #1E3A5F;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in → Auth page
  if (!session) {
    return <AuthPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':     return <Dashboard />;
      case 'ai-assistant':  return <AiAssistant />;
      case 'todo':          return <TaskPlanner />;
      case 'community':     return <CommunityChannels />;
      case 'study-tools':   return <StudyTools />;
      case 'pdf-tools':     return <PdfTools />;
      case 'calculator':    return <Calculator />;
      case 'academic-search': return <AcademicSearch />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-wrapper">
          {renderActiveView()}
        </main>
      </div>
      <ProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
