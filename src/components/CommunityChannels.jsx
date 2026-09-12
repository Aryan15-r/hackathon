import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Hash,
  Lock,
  Plus,
  Send,
  Users,
  Shield,
  Smile,
  Check,
  ChevronRight
} from 'lucide-react';

export default function CommunityChannels() {
  const {
    communities,
    setCommunities,
    activeCommunityId,
    setActiveCommunityId,
    activeChannelId,
    setActiveChannelId,
    messages,
    sendMessage,
    addReaction,
    userProfile
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [unlockedPrivateRooms, setUnlockedPrivateRooms] = useState([]);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [targetPrivateComm, setTargetPrivateComm] = useState(null);
  const [isCreateCommModalOpen, setIsCreateCommModalOpen] = useState(false);

  const [newComm, setNewComm] = useState({
    name: '',
    description: '',
    icon: '📚',
    category: 'General',
    is_private: false,
    passcode: ''
  });

  const activeComm = communities.find(c => c.id === activeCommunityId) || communities[0];
  const activeChannel = activeComm?.channels?.find(ch => ch.id === activeChannelId) || activeComm?.channels?.[0];

  const channelMessages = messages.filter(m => m.channel_id === (activeChannel?.id || 'chan-1'));

  const handleSelectCommunity = (comm) => {
    if (comm.is_private && !unlockedPrivateRooms.includes(comm.id)) {
      setTargetPrivateComm(comm);
      setIsPasscodeModalOpen(true);
      return;
    }

    setActiveCommunityId(comm.id);
    if (comm.channels && comm.channels.length > 0) {
      setActiveChannelId(comm.channels[0].id);
    }
  };

  const handleUnlockPrivateRoom = (e) => {
    e.preventDefault();
    if (!targetPrivateComm) return;

    if (passcodeAttempt === targetPrivateComm.passcode || passcodeAttempt === '1234') {
      setUnlockedPrivateRooms(prev => [...prev, targetPrivateComm.id]);
      setActiveCommunityId(targetPrivateComm.id);
      if (targetPrivateComm.channels?.length > 0) {
        setActiveChannelId(targetPrivateComm.channels[0].id);
      }
      setIsPasscodeModalOpen(false);
      setPasscodeAttempt('');
    } else {
      alert('Incorrect passcode. Try passcode: 1234');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    sendMessage(activeChannel.id, messageInput);
    setMessageInput('');
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newComm.name.trim()) return;
    const { data, error } = await supabase
      .from('communities')
      .insert({ name: newComm.name, description: newComm.description, icon: newComm.icon })
      .select('*, channels(*)')
      .single();

    if (!error && data) {
      setCommunities(prev => [...prev, data]);
      setActiveCommunityId(data.id);
    }
    setIsCreateCommModalOpen(false);
    setNewComm({ name: '', description: '', icon: '📚', category: 'General', is_private: false, passcode: '' });
  };

  const emojiOptions = ['👍', '🔥', '🚀', '❤️', '💡', '💯'];

  return (
    <div className="community-page animate-fade-in">
      {/* Sidebar Channels List */}
      <div className="community-sidebar glass-card">
        <div className="comm-sidebar-header">
          <h3>Peer Communities</h3>
          <button className="add-comm-btn" onClick={() => setIsCreateCommModalOpen(true)} title="Create Room">
            <Plus size={16} />
          </button>
        </div>

        {/* Communities Navigation */}
        <div className="communities-list">
          {communities.map(comm => {
            const isActive = comm.id === activeCommunityId;
            const isLocked = comm.is_private && !unlockedPrivateRooms.includes(comm.id);

            return (
              <div key={comm.id} className="comm-group">
                <button
                  className={`comm-button ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectCommunity(comm)}
                >
                  <span className="comm-icon">{comm.icon || '💬'}</span>
                  <div className="comm-names">
                    <span className="comm-title">{comm.name}</span>
                    <span className="comm-cat">{comm.category}</span>
                  </div>
                  {isLocked && <Lock size={14} className="lock-icon" />}
                </button>

                {/* Sub-channels */}
                {isActive && (
                  <div className="channels-sublist">
                    {comm.channels?.map(chan => {
                      const isChanActive = chan.id === activeChannelId;
                      return (
                        <button
                          key={chan.id}
                          className={`chan-sub-btn ${isChanActive ? 'active' : ''}`}
                          onClick={() => setActiveChannelId(chan.id)}
                        >
                          <Hash size={15} />
                          <span>{chan.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="chat-stream-container glass-card">
        {/* Active Channel Header */}
        <div className="channel-header">
          <div className="chan-header-title">
            <Hash size={22} className="hash-icon" />
            <div>
              <h2>{activeChannel?.name || 'general'}</h2>
              <span className="chan-desc">{activeChannel?.description || 'Community discussion room'}</span>
            </div>
          </div>

          <div className="chan-stats">
            <Users size={16} />
            <span>42 Members Online</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="messages-feed">
          {channelMessages.length === 0 ? (
            <div className="empty-messages">
              <MessageSquare size={36} className="empty-msg-icon" />
              <p>No messages in #{activeChannel?.name || 'this channel'} yet. Start the discussion!</p>
            </div>
          ) : (
            channelMessages.map(msg => {
              const author = msg.profiles?.full_name || 'Student';
              const username = msg.profiles?.username || 'user';
              const college = msg.profiles?.college || '';
              const av = msg.profiles?.avatar_url;
              const initials = author.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
              const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
              <div key={msg.id} className="msg-row">
                {av ? (
                  <img src={av} alt={author} className="sender-avatar" />
                ) : (
                  <div className="sender-avatar" style={{ background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', borderRadius: '50%', flexShrink: 0 }}>{initials}</div>
                )}

                <div className="msg-body">
                  <div className="sender-header">
                    <span className="sender-name">{author}</span>
                    <span className="sender-college">@{username}{college ? ` • ${college}` : ''}</span>
                    <span className="msg-time">{ts}</span>
                  </div>

                  <p className="msg-text">{msg.content}</p>

                  {/* Message Emoji Reactions */}
                  <div className="reactions-row">
                    {msg.reactions?.map((react, rIdx) => (
                      <button
                        key={rIdx}
                        className="reaction-pill"
                        onClick={() => addReaction(msg.id, react.emoji)}
                      >
                        <span>{react.emoji}</span>
                        <span className="count">{react.count}</span>
                      </button>
                    ))}

                    <div className="add-reaction-picker">
                      {emojiOptions.map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-opt"
                          onClick={() => addReaction(msg.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}

        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="msg-input-bar">
          <input
            type="text"
            placeholder={`Message #${activeChannel?.name || 'general'}...`}
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            className="chat-text-input"
          />
          <button type="submit" disabled={!messageInput.trim()} className="gradient-button">
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Private Room Passcode Modal */}
      {isPasscodeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasscodeModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Lock size={18} /> Private Study Room Lock</h2>
              <button className="close-btn" onClick={() => setIsPasscodeModalOpen(false)}>✕</button>
            </div>

            <p className="passcode-info">
              Enter room access passcode for <strong>{targetPrivateComm?.name}</strong> (Demo passcode: <code>1234</code>)
            </p>

            <form onSubmit={handleUnlockPrivateRoom} className="passcode-form">
              <input
                type="password"
                placeholder="Enter 4-digit passcode..."
                value={passcodeAttempt}
                onChange={e => setPasscodeAttempt(e.target.value)}
                required
                className="passcode-input"
              />

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsPasscodeModalOpen(false)}>Cancel</button>
                <button type="submit" className="gradient-button">Unlock Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {isCreateCommModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateCommModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Study Community</h2>
              <button className="close-btn" onClick={() => setIsCreateCommModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCommunity} className="comm-form">
              <div className="form-group">
                <label>Community Name *</label>
                <input
                  type="text"
                  placeholder="e.g. AI & Machine Learning Lab"
                  value={newComm.name}
                  onChange={e => setNewComm({ ...newComm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / Robotics"
                  value={newComm.category}
                  onChange={e => setNewComm({ ...newComm, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Display Icon (Emoji)</label>
                <input
                  type="text"
                  value={newComm.icon}
                  onChange={e => setNewComm({ ...newComm, icon: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newComm.is_private}
                    onChange={e => setNewComm({ ...newComm, is_private: e.target.checked })}
                  />
                  <span>Private Room (Requires Passcode)</span>
                </label>
              </div>

              {newComm.is_private && (
                <div className="form-group">
                  <label>Access Passcode</label>
                  <input
                    type="text"
                    placeholder="Set passcode (e.g. 1234)"
                    value={newComm.passcode}
                    onChange={e => setNewComm({ ...newComm, passcode: e.target.value })}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsCreateCommModalOpen(false)}>Cancel</button>
                <button type="submit" className="gradient-button">Create Community</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Community Styles */}
      <style>{`
        .community-page {
          display: flex;
          gap: 1.25rem;
          height: calc(100vh - 120px);
        }

        .community-sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          gap: 1rem;
          flex-shrink: 0;
        }

        .comm-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .add-comm-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.2);
          border: none;
          color: #a5b4fc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .communities-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .comm-button {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .comm-button.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
          color: var(--text-primary);
        }

        .comm-icon { font-size: 1.1rem; }

        .comm-names {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .comm-title {
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .comm-cat {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .lock-icon { color: var(--accent-amber); }

        .channels-sublist {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
        }

        .chan-sub-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.6rem;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          text-align: left;
        }

        .chan-sub-btn.active {
          color: #818cf8;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.1);
        }

        .chat-stream-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .channel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--card-border);
        }

        .chan-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hash-icon { color: var(--accent-primary); }

        .chan-header-title h2 { font-size: 1.15rem; }
        .chan-desc { font-size: 0.78rem; color: var(--text-muted); }

        .chan-stats {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--accent-green);
        }

        .messages-feed {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .msg-row {
          display: flex;
          gap: 0.85rem;
        }

        .sender-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .msg-body {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex: 1;
        }

        .sender-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .sender-name { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
        .sender-college { font-size: 0.75rem; color: var(--text-muted); }
        .msg-time { font-size: 0.7rem; color: var(--text-muted); margin-left: auto; }

        .msg-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .reactions-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.35rem;
        }

        .reaction-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .add-reaction-picker {
          display: flex;
          gap: 0.2rem;
          opacity: 0.6;
        }

        .add-reaction-picker:hover { opacity: 1; }

        .emoji-opt {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .msg-input-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--card-border);
        }

        .chat-text-input {
          flex: 1;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
        }

        .chat-text-input:focus { outline: none; border-color: var(--accent-primary); }

        .empty-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 3rem;
          color: var(--text-muted);
        }

        .passcode-info {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .passcode-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
