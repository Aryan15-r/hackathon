import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Save, User, GraduationCap, BookOpen, Calendar, Image } from 'lucide-react';

export default function ProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, userProfile, setUserProfile } = useApp();

  const [formData, setFormData] = useState({ ...userProfile });

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserProfile(formData);
    setIsProfileModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
      <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Student Profile Settings</h2>
          <button className="close-btn" onClick={() => setIsProfileModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="avatar-preview-section">
            <img src={formData.avatarUrl} alt="Avatar" className="avatar-preview" />
            <div className="avatar-input-wrapper">
              <label><Image size={14} /> Avatar Image URL</label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label><User size={14} /> Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label><User size={14} /> Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group span-2">
              <label><GraduationCap size={14} /> College / University</label>
              <input
                type="text"
                value={formData.college}
                onChange={e => setFormData({ ...formData, college: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label><BookOpen size={14} /> Branch of Study</label>
              <input
                type="text"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label><Calendar size={14} /> Academic Year</label>
              <select
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gradient-button">
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 560px;
          padding: 1.75rem;
          border-radius: var(--radius-lg);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .avatar-preview-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding: 0.85rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
        }

        .avatar-preview {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--accent-primary);
        }

        .avatar-input-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .span-2 {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label, .avatar-input-wrapper label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .form-group input, .form-group select, .avatar-input-wrapper input {
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.85rem;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
        }

        .form-group input:focus, .form-group select:focus, .avatar-input-wrapper input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
