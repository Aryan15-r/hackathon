import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => { setError(''); setSuccessMsg(''); };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('✅ Check your email to confirm your account, then sign in!');
        setTab('signin');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>

      <div className="auth-container">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="auth-brand-name">StudySpace</h1>
            <p className="auth-brand-tagline">Your all-in-one academic workspace</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => { setTab('signin'); clearMessages(); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); clearMessages(); }}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="auth-form">
            {tab === 'signup' && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Aryan Sharma"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {tab === 'signin' && (
              <button
                type="button"
                className="auth-forgot-link"
                onClick={async () => {
                  if (!email) { setError('Enter your email first.'); return; }
                  await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                  setSuccessMsg('Password reset email sent! Check your inbox.');
                }}
              >
                Forgot password?
              </button>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : null}
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch-text">
            {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="auth-switch-link"
              onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); clearMessages(); }}
            >
              {tab === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: #FDF6EC;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        .auth-bg-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .auth-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(60px);
        }

        .auth-shape-1 {
          width: 500px; height: 500px;
          background: #1E3A5F;
          top: -150px; right: -100px;
        }

        .auth-shape-2 {
          width: 350px; height: 350px;
          background: #D97706;
          bottom: -80px; left: -80px;
        }

        .auth-shape-3 {
          width: 250px; height: 250px;
          background: #1E3A5F;
          bottom: 100px; right: 200px;
          opacity: 0.08;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          position: relative;
          z-index: 1;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .auth-logo {
          width: 50px;
          height: 50px;
          background: #1E3A5F;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(30, 58, 95, 0.3);
        }

        .auth-brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #1A1A2E;
          margin: 0;
        }

        .auth-brand-tagline {
          font-size: 0.82rem;
          color: #5a6880;
          margin: 0;
        }

        .auth-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 40px rgba(30, 58, 95, 0.12);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid rgba(30, 58, 95, 0.08);
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #F5EFE6;
          border-radius: 10px;
          padding: 4px;
        }

        .auth-tab {
          padding: 0.6rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: #7a8699;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-tab.active {
          background: #fff;
          color: #1E3A5F;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .auth-alert-error {
          background: #FEF2F2;
          color: #B91C1C;
          border: 1px solid #FCA5A5;
        }

        .auth-alert-success {
          background: #F0FDF4;
          color: #166534;
          border: 1px solid #86EFAC;
        }

        .auth-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1A1A2E;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-google-btn:hover:not(:disabled) {
          background: #F8FAFC;
          border-color: #CBD5E1;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        .auth-google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #9CA3AF;
          font-size: 0.8rem;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E5E7EB;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #374151;
        }

        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.85rem;
          color: #9CA3AF;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          padding: 0.75rem 0.9rem 0.75rem 2.5rem;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          color: #1A1A2E;
          background: #FAFAFA;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .auth-input::placeholder { color: #C4C9D4; }

        .auth-input:focus {
          outline: none;
          border-color: #1E3A5F;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
        }

        .auth-pw-toggle {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .auth-pw-toggle:hover { color: #1E3A5F; }

        .auth-forgot-link {
          background: none;
          border: none;
          color: #1E3A5F;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          text-align: right;
          padding: 0;
          margin-top: -0.5rem;
          font-family: 'Inter', sans-serif;
        }

        .auth-forgot-link:hover { text-decoration: underline; }

        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: #1E3A5F;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: #152b46;
          box-shadow: 0 4px 16px rgba(30, 58, 95, 0.3);
          transform: translateY(-1px);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-switch-text {
          text-align: center;
          font-size: 0.85rem;
          color: #6B7280;
          margin: 0;
        }

        .auth-switch-link {
          background: none;
          border: none;
          color: #1E3A5F;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          padding: 0;
        }

        .auth-switch-link:hover { text-decoration: underline; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
