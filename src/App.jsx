import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthSectionThree from './components/ui/AuthSectionThree';
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
import OnboardingModal from './components/OnboardingModal';
import AttendanceTracker from './components/AttendanceTracker';
import NotFoundPage from './components/NotFoundPage';

import AlarmModal from './components/AlarmModal';
import CookieConsent from './components/CookieConsent';
import SupportModal from './components/SupportModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import MobileStickyCTA from './components/MobileStickyCTA';
import Toast from './components/ui/Toast';
import { trackPageView } from './lib/analytics';

const TAB_TITLES = {
  dashboard: 'Dashboard — StudySpace',
  'ai-assistant': 'AI Tutor & Assistant — StudySpace',
  todo: 'Tasks & Exam Planner — StudySpace',
  attendance: 'Attendance & 75% Rule Tracker — StudySpace',
  community: 'Peer Community Hub — StudySpace',
  'study-tools': 'Focus Timer & Study Tools — StudySpace',
  'pdf-tools': 'PDF Document Studio — StudySpace',
  calculator: 'Scientific Calculator — StudySpace',
  'academic-search': 'Academic Paper & Textbook Search — StudySpace',
};

const TAB_DESCRIPTIONS = {
  dashboard: 'StudySpace dashboard consolidating tasks, focus stats, AI tutors, and attendance.',
  'ai-assistant': 'Ask Gemini 2.0 AI tutor for step-by-step math, physics, coding, and essay explanations.',
  todo: 'Organize coursework deadlines, exam countdowns, and daily task priority lists.',
  attendance: 'Monitor your college class attendance and track safety buffers against the 75% rule.',
  community: 'Join live student study rooms, exchange course notes, and collaborate with peers.',
  'study-tools': 'Pomodoro timer, ambient study sounds, and focus streak tracking for ultimate productivity.',
  'pdf-tools': 'Merge, split, compress, and extract pages from academic lecture slides and PDFs.',
  calculator: 'Advanced scientific math calculator with trigonometry, logarithms, and history logs.',
  'academic-search': 'Search millions of open access research papers, arXiv preprints, and textbook notes.',
};

function MainAppContent() {
  const { session, authLoading, activeTab, setActiveTab, isOnboardingRequired } = useApp();

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic Document Title & SEO Meta updates
  useEffect(() => {
    const title = TAB_TITLES[activeTab] || 'StudySpace — Student Productivity Workspace';
    document.title = title;

    const desc = TAB_DESCRIPTIONS[activeTab] || 'All-in-one student productivity workspace.';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }

    trackPageView(activeTab);
  }, [activeTab]);

  // Global event listeners for modal triggers
  useEffect(() => {
    const handleSupport = () => setIsSupportOpen(true);
    const handlePrivacy = () => setIsPrivacyOpen(true);
    const handleTerms = () => setIsTermsOpen(true);
    const handleToast = (e) => setToast(e.detail);

    window.addEventListener('open-support-modal', handleSupport);
    window.addEventListener('open-privacy-modal', handlePrivacy);
    window.addEventListener('open-terms-modal', handleTerms);
    window.addEventListener('show-toast', handleToast);

    return () => {
      window.removeEventListener('open-support-modal', handleSupport);
      window.removeEventListener('open-privacy-modal', handlePrivacy);
      window.removeEventListener('open-terms-modal', handleTerms);
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

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
    return (
      <>
        <AuthSectionThree />
        <CookieConsent
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
        />
        <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <TermsOfService isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onShowToast={setToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Google OAuth user not yet completed registration → Redirect to profile onboarding
  if (isOnboardingRequired) {
    return <OnboardingModal />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':       return <Dashboard />;
      case 'ai-assistant':    return <AiAssistant />;
      case 'todo':            return <TaskPlanner />;
      case 'attendance':      return <AttendanceTracker />;
      case 'community':       return <CommunityChannels />;
      case 'study-tools':     return <StudyTools />;
      case 'pdf-tools':       return <PdfTools />;
      case 'calculator':      return <Calculator />;
      case 'academic-search': return <AcademicSearch />;
      default:                return <NotFoundPage onGoHome={(tab = 'dashboard') => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-wrapper pb-20 md:pb-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ProfileModal />
      <AlarmModal />
      <MobileStickyCTA />
      <CookieConsent
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onShowToast={setToast} />
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfService isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
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
