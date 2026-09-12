import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Save, User, GraduationCap, BookOpen, Calendar, Image, Loader2 } from 'lucide-react';

export default function ProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, userProfile, updateProfile, session } = useApp();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    college: '',
    branch: '',
    year: 1,
    bio: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Sync form from real profile whenever modal opens
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name:  userProfile.full_name  || '',
        username:   userProfile.username   || '',
        college:    userProfile.college    || '',
        branch:     userProfile.branch     || '',
        year:       userProfile.year       || 1,
        bio:        userProfile.bio        || '',
        avatar_url: userProfile.avatar_url || '',
      });
    }
  }, [userProfile, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const initials = formData.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    const { error } = await updateProfile(formData);
    setSaving(false);
    if (error) {
      setSaveMsg('❌ ' + error.message);
    } else {
      setSaveMsg('✅ Profile saved!');
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setSaveMsg('');
      }, 1200);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            Profile Settings
          </h2>
          <button className="modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)' }}>
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--card-border)' }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Image size={13} /> Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="form-group">
            <label className="form-label">Email (from account)</label>
            <input
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="form-input"
              style={{ background: '#F3F0EC', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
          </div>

          {/* Name + Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><User size={13} style={{ display: 'inline', marginRight: 4 }} />Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Aryan Sharma"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label"><User size={13} style={{ display: 'inline', marginRight: 4 }} />Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="aryan_dev"
                className="form-input"
              />
            </div>
          </div>

          {/* College */}
          <div className="form-group">
            <label className="form-label"><GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />College / University</label>
            <input
              type="text"
              value={formData.college}
              onChange={e => setFormData({ ...formData, college: e.target.value })}
              placeholder="Delhi Technological University"
              className="form-input"
            />
          </div>

          {/* Branch + Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><BookOpen size={13} style={{ display: 'inline', marginRight: 4 }} />Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Computer Science"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label"><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />Year</label>
              <select
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                className="form-input"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="B.Tech CSE | AI & Web Developer"
              rows={2}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {saveMsg && (
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: saveMsg.startsWith('✅') ? '#065F46' : '#991B1B', background: saveMsg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', padding: '0.6rem 0.9rem', borderRadius: 8 }}>
              {saveMsg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gradient-button" disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
