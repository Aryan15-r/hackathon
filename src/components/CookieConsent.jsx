import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsent({ onOpenPrivacy, onOpenTerms }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('studyspace_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('studyspace_cookie_consent', JSON.stringify({ choice: 'all', date: new Date().toISOString() }));
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('studyspace_cookie_consent', JSON.stringify({ choice: 'essential', date: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999] animate-slide-up">
      <div
        className="p-5 rounded-2xl bg-[#0F172A] shadow-2xl border border-amber-400/40 backdrop-blur-xl"
        style={{ color: '#FFFFFF' }}
      >
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
            <Cookie size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-1.5" style={{ color: '#FFFFFF' }}>
              We Value Your Privacy
            </h3>
            <p className="text-xs mt-1.5 leading-relaxed font-medium" style={{ color: '#F1F5F9' }}>
              StudySpace uses essential cookies and local storage to save your study goals, focus timer preferences, and theme state.
              Read our{' '}
              <button
                onClick={onOpenPrivacy}
                className="underline font-bold cursor-pointer"
                style={{ color: '#FBBF24' }}
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                onClick={onOpenTerms}
                className="underline font-bold cursor-pointer"
                style={{ color: '#FBBF24' }}
              >
                Terms
              </button>.
            </p>

            <div className="flex items-center gap-2.5 mt-4">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-[#0F172A] transition-all cursor-pointer shadow-lg"
              >
                Accept All
              </button>
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/20"
              >
                Essential Only
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all ml-auto cursor-pointer"
                aria-label="Dismiss cookie banner"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
