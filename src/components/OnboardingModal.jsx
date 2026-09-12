import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, User, Mail, School, BookOpen, Calendar, ArrowRight, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingModal() {
  const { session, completeRegistration, signOut } = useApp();

  const googleUser = session?.user;
  const initialEmail = googleUser?.email || '';
  const initialName = googleUser?.user_metadata?.full_name || googleUser?.user_metadata?.name || initialEmail.split('@')[0] || '';
  const initialUsername = (googleUser?.user_metadata?.preferred_username || initialEmail.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const [fullName, setFullName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await completeRegistration({
        username: username.trim(),
        full_name: fullName.trim() || initialName,
        college: college.trim(),
        branch: branch.trim(),
        year
      });

      if (result?.error && result.error.message?.includes('duplicate key')) {
        setError('This username is already taken. Please pick another one.');
      }
    } catch (err) {
      setError('An error occurred saving your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF6EC] flex items-center justify-center p-4 sm:p-6 md:p-10 antialiased">
      <div className="w-full max-w-[560px] bg-white rounded-2xl border border-[#1E3A5F]/15 shadow-xl overflow-hidden animate-fade-in">
        {/* Header Banner */}
        <div className="bg-[#1E3A5F] px-6 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Complete Your Registration</h2>
              <p className="text-xs text-white/70">Finish setting up your StudySpace student profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out and cancel"
            className="flex items-center gap-1.5 text-xs text-white/75 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="bg-[#1E3A5F]/5 border border-[#1E3A5F]/10 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1E3A5F]/80 leading-relaxed">
              Google Account Authenticated: <strong>{initialEmail}</strong>. Complete the details below to finalize your account registration and enter the dashboard.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email (Read Only from Google) */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
              <Mail size={13} /> Email Address (from Google)
            </label>
            <div
              className="flex h-10 items-center rounded-lg border border-black/10 bg-black/[0.03] text-xs text-black/60 font-mono select-none"
              style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
            >
              {initialEmail}
            </div>
          </div>

          {/* Username & Full Name Row */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
                <User size={13} /> Username *
              </label>
              <div
                className="relative flex h-10 items-center rounded-lg border border-black/15 bg-white focus-within:border-[#1E3A5F] focus-within:ring-2 focus-within:ring-[#1E3A5F]/10 transition-all"
                style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
              >
                <span className="text-black/40 text-xs mr-1 font-mono">@</span>
                <input
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-transparent text-xs text-black outline-none font-medium placeholder:text-black/35"
                  style={{ paddingLeft: '0.35rem' }}
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
                <User size={13} /> Full Name
              </label>
              <div
                className="flex h-10 items-center rounded-lg border border-black/15 bg-white focus-within:border-[#1E3A5F] focus-within:ring-2 focus-within:ring-[#1E3A5F]/10 transition-all"
                style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-transparent text-xs text-black outline-none font-medium placeholder:text-black/35"
                  style={{ paddingLeft: '0.25rem' }}
                />
              </div>
            </div>
          </div>

          {/* College / University */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
              <School size={13} /> College / University Name
            </label>
            <div
              className="flex h-10 items-center rounded-lg border border-black/15 bg-white focus-within:border-[#1E3A5F] focus-within:ring-2 focus-within:ring-[#1E3A5F]/10 transition-all"
              style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
            >
              <input
                type="text"
                placeholder="e.g. National Institute of Technology, Delhi"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full bg-transparent text-xs text-black outline-none placeholder:text-black/35"
                style={{ paddingLeft: '0.25rem' }}
              />
            </div>
          </div>

          {/* Branch & Year Row */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
                <BookOpen size={13} /> Department / Major
              </label>
              <div
                className="flex h-10 items-center rounded-lg border border-black/15 bg-white focus-within:border-[#1E3A5F] focus-within:ring-2 focus-within:ring-[#1E3A5F]/10 transition-all"
                style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
              >
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Eng."
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-transparent text-xs text-black outline-none placeholder:text-black/35"
                  style={{ paddingLeft: '0.25rem' }}
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1A1A2E]/70 flex items-center gap-1.5">
                <Calendar size={13} /> Academic Year
              </label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full h-10 rounded-lg border border-black/15 bg-white text-xs text-black outline-none cursor-pointer focus:border-[#1E3A5F]"
                style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
                <option value="5">Postgraduate / Masters</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <>
                  <span>Complete Registration & Enter StudySpace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
