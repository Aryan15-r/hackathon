import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-assistant':
        return <AiAssistant />;
      case 'todo':
        return <TaskPlanner />;
      case 'community':
        return <CommunityChannels />;
      case 'study-tools':
        return <StudyTools />;
      case 'pdf-tools':
        return <PdfTools />;
      case 'calculator':
        return <Calculator />;
      case 'academic-search':
        return <AcademicSearch />;
      default:
        return <Dashboard />;
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
