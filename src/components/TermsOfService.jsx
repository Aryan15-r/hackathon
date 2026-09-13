import React from 'react';
import { FileText, X, CheckCircle, Scale } from 'lucide-react';

export default function TermsOfService({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#FDF6EC] shadow-2xl border border-[#1E3A5F]/10 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 bg-[#1E3A5F] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">Terms of Service</h2>
              <p className="text-xs text-white/70">Effective Date: September 14, 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close Terms of Service"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#1A1A2E] leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit'] flex items-center gap-2">
              <CheckCircle size={16} /> 1. Acceptance of Terms
            </h3>
            <p className="text-[#6B7280]">
              By registering for or utilizing StudySpace, you agree to comply with these Terms of Service. If you do not agree, you must refrain from using the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">2. Permitted Academic Use</h3>
            <p className="text-[#6B7280]">
              StudySpace is designed as an educational productivity suite. Users are responsible for adhering to their academic institution's honor code and plagiarism guidelines when utilizing AI assistance, academic search, or peer channel sharing.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">3. Community Standards & Code of Conduct</h3>
            <p className="text-[#6B7280]">
              In Community Channels, users must remain respectful. Spam, harassment, hate speech, illegal distribution of copyrighted textbook materials, or malicious content will lead to immediate account suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">4. Limitation of Liability</h3>
            <p className="text-[#6B7280]">
              StudySpace is provided "as is" without express or implied warranties. While we maintain high uptime and automated backups, StudySpace is not liable for indirect damages resulting from exam scheduling errors or attendance tracking discrepancies.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#1E3A5F] font-['Outfit']">5. Modifications</h3>
            <p className="text-[#6B7280]">
              We reserve the right to modify these terms as platform capabilities expand. Continued use of StudySpace following published updates constitutes acceptance of new terms.
            </p>
          </section>
        </div>

        <div className="p-4 bg-white border-t border-[#1E3A5F]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E3A5F] text-white font-semibold text-xs cursor-pointer"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
}
