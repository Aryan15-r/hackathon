import React from 'react';
import { Shield, X, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#FDF6EC] shadow-2xl border border-[#1E3A5F]/10 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 bg-[#1E3A5F] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-emerald-300">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">Privacy Policy</h2>
              <p className="text-xs text-white/70">Last updated: September 14, 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close Privacy Policy"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#1A1A2E] leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit'] flex items-center gap-2">
              <Lock size={16} /> 1. Commitment to Student Privacy
            </h3>
            <p className="text-[#6B7280]">
              StudySpace is built specifically for college and university students. We hold data security and privacy to the highest standard. We do not sell, rent, or monetize your personal information or academic data to third parties under any circumstances.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit'] flex items-center gap-2">
              <Eye size={16} /> 2. Information We Collect
            </h3>
            <p className="text-[#6B7280]">
              We collect minimal information required to deliver the core workspace functionality:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li><strong>Account Credentials:</strong> Email address and encrypted password via Supabase Auth.</li>
              <li><strong>Profile Information:</strong> Full name, university, major, and graduation year.</li>
              <li><strong>Workspace Activity:</strong> Task lists, study goals, attendance logs, and AI conversation queries.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit'] flex items-center gap-2">
              <FileText size={16} /> 3. Data Storage & Security
            </h3>
            <p className="text-[#6B7280]">
              All student data is encrypted both in transit (TLS 1.3) and at rest using AES-256 standards. Cloud database instances are protected by strict Row Level Security (RLS) policies ensuring only authenticated account owners can read or write their personal data.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">4. AI Interaction Security</h3>
            <p className="text-[#6B7280]">
              Queries sent to the StudySpace AI Assistant are processed using privacy-compliant API proxies. Conversations are never used to train global public machine learning models without your explicit opt-in.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">5. Contact Us</h3>
            <p className="text-[#6B7280]">
              If you have any questions regarding this Privacy Policy or wish to request complete deletion of your account and data, contact privacy@studyspace.app.
            </p>
          </section>
        </div>

        <div className="p-4 bg-white border-t border-[#1E3A5F]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E3A5F] text-white font-semibold text-xs cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
