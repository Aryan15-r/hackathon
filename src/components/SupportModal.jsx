import React, { useState } from 'react';
import { Mail, HelpCircle, Send, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, X, ExternalLink } from 'lucide-react';

export default function SupportModal({ isOpen, onClose, onShowToast }) {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'contact'
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does the StudySpace AI Tutor work?',
      a: 'StudySpace connects directly to Gemini 2.0/1.5 Flash models via high-speed API cascades. If you are offline, it falls back to an internal academic engine.'
    },
    {
      q: 'Is my data synchronized across devices?',
      a: 'Yes! When signed in, your tasks, attendance data, notes, and profile settings are synced securely with Supabase database.'
    },
    {
      q: 'How is attendance percentage calculated?',
      a: 'Attendance percentage is computed using (Attended Sessions / Total Conducted Sessions) * 100 per course. Our rule alerts you whenever your course falls below 75%.'
    },
    {
      q: 'Is StudySpace free for college students?',
      a: 'StudySpace is 100% free for all students, with full access to PDF studio, scientific calculator, academic search, and community channels.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Message Delivered',
          message: 'Thank you for reaching out! Our team will reply to your email within 24 hours.'
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FDF6EC] shadow-2xl border border-[#1E3A5F]/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#1E3A5F] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-amber-300">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">Help Center & Support</h2>
              <p className="text-xs text-white/70">Get quick answers or speak directly with our team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close support modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#1E3A5F]/10 bg-white px-6 pt-3">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2.5 text-xs font-bold font-['Outfit'] border-b-2 transition-all cursor-pointer ${
              activeTab === 'faq' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 text-xs font-bold font-['Outfit'] border-b-2 transition-all cursor-pointer ${
              activeTab === 'contact' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            Contact Support & Feedback
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'faq' ? (
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#1E3A5F]/10 bg-white overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-[#1A1A2E] cursor-pointer hover:bg-[#FDF6EC]/50"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-[#1E3A5F]" /> : <ChevronDown size={16} className="text-[#6B7280]" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-[#6B7280] leading-relaxed border-t border-[#1E3A5F]/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xs text-[#1A1A2E] font-medium">Have a specific bug or feature request?</p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="mt-2 text-xs font-bold text-[#1E3A5F] underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Send us a direct message <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A2E] font-['Outfit']">Thank You for Your Feedback!</h3>
                  <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                    We received your submission. Our support leads monitor inquiries constantly and will reach out to <strong>{formData.email}</strong>.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="Alex Morgan"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F]/20 text-xs bg-white focus:outline-none focus:border-[#1E3A5F]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="alex@college.edu"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F]/20 text-xs bg-white focus:outline-none focus:border-[#1E3A5F]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Bug Report / Feature Suggestion"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F]/20 text-xs bg-white focus:outline-none focus:border-[#1E3A5F]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you experienced or how we can improve StudySpace..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F]/20 text-xs bg-white focus:outline-none focus:border-[#1E3A5F]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#6B7280]">
                      Or email direct: <a href="mailto:support@studyspace.app" className="font-semibold text-[#1E3A5F]">support@studyspace.app</a>
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      {isSubmitting ? 'Sending...' : <>Send Message <Send size={14} /></>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
