import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  Hash,
  Volume2,
  Lock,
  Plus,
  Send,
  Users,
  Smile,
  Mic,
  MicOff,
  Headphones,
  VolumeX,
  PhoneOff,
  Monitor,
  Search,
  Pin,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Radio,
  Share2,
  X,
  Check
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
    userProfile,
    currentVoiceRoom,
    isMuted,
    setIsMuted,
    isDeafened,
    setIsDeafened,
    isScreenSharing,
    setIsScreenSharing,
    joinVoiceRoom,
    leaveVoiceRoom
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [unlockedPrivateRooms, setUnlockedPrivateRooms] = useState([]);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [targetPrivateComm, setTargetPrivateComm] = useState(null);
  const [isCreateCommModalOpen, setIsCreateCommModalOpen] = useState(false);
  const [showMemberSidebar, setShowMemberSidebar] = useState(true);

  // Category collapsed state
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (catName) => {
    setCollapsedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const [newComm, setNewComm] = useState({
    name: '',
    description: '',
    icon: '📚',
    category: 'Text',
    is_private: false,
    passcode: ''
  });

  // Empty initial hubs - must create or join via code
  const defaultHubs = [];

  const activeHubList = (communities && communities.length > 0) ? communities : defaultHubs;
  const activeComm = activeHubList.find(c => c.id === activeCommunityId) || activeHubList[0] || {};
  
  // Ensure default channels exist
  const activeChannels = activeComm.channels || [];

  const activeChannel = activeChannels.find(ch => ch.id === activeChannelId) || activeChannels[0] || {};
  const isVoiceChannelActive = false; // VC Removed

  const channelMessages = messages.filter(m => m.channel_id === (activeChannel?.id || 'chan-1'));

  const handleSelectHub = (hub) => {
    setActiveCommunityId(hub.id);
    if (hub.channels && hub.channels.length > 0) {
      setActiveChannelId(hub.channels[0].id);
    }
  };

  const handleSelectChannel = (chan) => {
    if (chan.type === 'private' || chan.name?.startsWith('🔒')) {
      if (!unlockedPrivateRooms.includes(chan.id)) {
        setTargetPrivateComm(chan);
        setIsPasscodeModalOpen(true);
        return;
      }
    }

    setActiveChannelId(chan.id);
    if (chan.type === 'voice' || chan.name?.startsWith('🔊')) {
      joinVoiceRoom(chan.name);
    }
  };

  const handleUnlockPrivateRoom = (e) => {
    e.preventDefault();
    if (!targetPrivateComm) return;

    const correctPasscode = targetPrivateComm.passcode || '1234';
    if (passcodeAttempt === correctPasscode || passcodeAttempt === '1234') {
      setUnlockedPrivateRooms(prev => [...prev, targetPrivateComm.id]);
      setActiveChannelId(targetPrivateComm.id);
      setIsPasscodeModalOpen(false);
      setPasscodeAttempt('');
    } else {
      alert('Incorrect passcode. Demo passcode: 1234');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    sendMessage(activeChannel.id, messageInput);
    setMessageInput('');
  };

  const [joinCode, setJoinCode] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newComm.name.trim()) return;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newHubObj = {
      id: 'hub-' + Date.now(),
      name: newComm.name,
      icon: newComm.icon || '📚',
      category: newComm.category || 'General',
      roomCode,
      channels: [
        { id: 'chan-' + Date.now(), name: 'general', type: 'text', description: 'General channel' },
        { id: 'chan-notes-' + Date.now(), name: 'notes-sharing', type: 'text', description: 'Share resources here' }
      ]
    };

    setCommunities(prev => [...prev, newHubObj]);
    setActiveCommunityId(newHubObj.id);
    setActiveChannelId(newHubObj.channels[0].id);
    setIsCreateCommModalOpen(false);
    setNewComm({ name: '', description: '', icon: '📚', category: 'General', is_private: false, passcode: '' });
  };

  const handleJoinCommunity = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const existingHub = communities.find(c => c.roomCode === joinCode.trim().toUpperCase());
    if (existingHub) {
      setActiveCommunityId(existingHub.id);
      setActiveChannelId(existingHub.channels[0]?.id);
      setIsJoinModalOpen(false);
      setJoinCode('');
    } else {
      alert('Invalid room code or server not found locally.');
    }
  };

  const emojiOptions = ['👍', '🔥', '🚀', '❤️', '💡', '💯'];

  // Mock members online
  const mockMembers = [];

  return (
    <div className="flex h-[calc(100vh-130px)] w-full bg-[#18191C] text-gray-200 rounded-2xl overflow-hidden shadow-2xl border border-white/10 font-['Inter'] animate-fade-in">
      
      {/* 1. DISCORD SERVER RAIL (Far Left) */}
      <div className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 gap-3 border-r border-white/5 shrink-0 z-20 select-none">
        
        {/* Home Server Icon */}
        <div
          onClick={() => handleSelectHub(activeHubList[0])}
          className="relative group cursor-pointer"
          title="StudySpace Home Hub"
        >
          <div className={`w-12 h-12 rounded-2xl transition-all duration-200 flex items-center justify-center text-xl bg-[#313338] text-[#5865F2] hover:bg-[#5865F2] hover:text-white hover:rounded-xl shadow-md ${activeComm.id === activeHubList[0].id ? '!bg-[#5865F2] !text-white !rounded-xl' : ''}`}>
            🎓
          </div>
          {activeComm.id === activeHubList[0].id && (
            <div className="absolute left-[-12px] top-3 w-2 h-6 bg-white rounded-r-full" />
          )}
        </div>

        <div className="w-8 h-[2px] bg-white/10 rounded-full my-0.5" />

        {/* Server / Hub Icon List */}
        <div className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto no-scrollbar">
          {activeHubList.map(hub => {
            const isActive = hub.id === activeCommunityId;
            return (
              <div key={hub.id} className="relative group cursor-pointer" onClick={() => handleSelectHub(hub)}>
                {/* Active Pill Bar */}
                <div className={`absolute left-[-12px] top-3 w-2 bg-white rounded-r-full transition-all duration-200 ${isActive ? 'h-6' : 'h-0 group-hover:h-3'}`} />
                <div className={`w-12 h-12 rounded-3xl group-hover:rounded-xl transition-all duration-200 flex items-center justify-center text-xl bg-[#313338] hover:bg-[#5865F2] text-white shadow-md ${isActive ? '!bg-[#5865F2] !rounded-xl' : ''}`}>
                  {hub.icon}
                </div>
              </div>
            );
          })}

          {/* Create & Join Hub Buttons */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="w-12 h-12 rounded-3xl hover:rounded-xl bg-[#313338] hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer"
            title="Join Server with Room Code"
          >
            <Search size={22} />
          </button>
          <button
            onClick={() => setIsCreateCommModalOpen(true)}
            className="w-12 h-12 rounded-3xl hover:rounded-xl bg-[#313338] hover:bg-[#23A55A] text-[#23A55A] hover:text-white flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer"
            title="Create New Private Server"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* 2. CHANNELS SIDEBAR (Middle Left) */}
      <div className="w-60 bg-[#2B2D31] flex flex-col border-r border-white/5 shrink-0 select-none">
        
        {/* Hub Title Header */}
        <div className="h-12 px-4 border-b border-[#1F2023] flex items-center justify-between shadow-sm bg-[#2B2D31]">
          <h2 className="font-bold text-white text-sm tracking-wide truncate flex items-center gap-2">
            <span>{activeComm.icon || '📚'}</span>
            <span className="truncate">{activeComm.name || 'No Server Selected'}</span>
          </h2>
          {activeComm.id && (
            <button onClick={() => setIsCreateCommModalOpen(true)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Plus size={18} />
            </button>
          )}
        </div>
        {activeComm.roomCode && (
          <div className="px-4 py-2 bg-[#1E1F22] text-[10px] text-gray-400 font-mono text-center shadow-inner cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(activeComm.roomCode)}>
            Room Code: <span className="font-bold text-indigo-400">{activeComm.roomCode}</span> (Click to copy)
          </div>
        )}

        {/* Channels List Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* TEXT CHANNELS CATEGORY */}
          <div>
            <button
              onClick={() => toggleCategory('text')}
              className="w-full flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-200 uppercase tracking-wider px-1 py-1 mb-1 transition-colors cursor-pointer"
            >
              {collapsedCategories['text'] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>Text Channels</span>
            </button>

            {!collapsedCategories['text'] && (
              <div className="space-y-0.5">
                {activeChannels.filter(c => c.type === 'text' || !c.name?.startsWith('🔊')).map(chan => {
                  const isActive = chan.id === activeChannelId;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${isActive ? 'bg-[#404249] text-white' : 'text-gray-400 hover:bg-[#35373C] hover:text-gray-200'}`}
                    >
                      <Hash size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">{chan.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* VOICE ROOMS REMOVED */}

          {/* PRIVATE ROOMS CATEGORY */}
          <div>
            <button
              onClick={() => toggleCategory('private')}
              className="w-full flex items-center gap-1 text-[11px] font-bold text-amber-400/90 hover:text-amber-300 uppercase tracking-wider px-1 py-1 mb-1 transition-colors cursor-pointer"
            >
              {collapsedCategories['private'] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>Private Locked Rooms</span>
            </button>

            {!collapsedCategories['private'] && (
              <div className="space-y-0.5">
                {activeChannels.filter(c => c.type === 'private' || c.name?.startsWith('🔒')).map(chan => {
                  const isActive = chan.id === activeChannelId;
                  const isUnlocked = unlockedPrivateRooms.includes(chan.id);
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${isActive ? 'bg-[#404249] text-white' : 'text-gray-400 hover:bg-[#35373C] hover:text-gray-200'}`}
                    >
                      <Lock size={15} className={isUnlocked ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'} />
                      <span className="truncate">{chan.name}</span>
                      {!isUnlocked && (
                        <span className="ml-auto text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                          LOCK
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ACTIVE VOICE CONTROL BAR REMOVED */}

        {/* Current User Bar */}
        <div className="h-14 bg-[#232428] px-3 flex items-center gap-2.5 border-t border-white/5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white">
              {userProfile?.full_name?.slice(0, 2).toUpperCase() || 'AS'}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#232428]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{userProfile?.full_name || 'Student User'}</div>
            <div className="text-[10px] text-gray-400 truncate">@{userProfile?.username || 'student'}</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CHAT / VOICE CANVAS (Center) */}
      <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
        
        {/* Header Bar */}
        <div className="h-12 px-4 border-b border-[#1F2023] flex items-center justify-between bg-[#313338] shadow-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {isVoiceChannelActive ? (
              <Volume2 size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <Hash size={20} className="text-gray-400 shrink-0" />
            )}
            <h3 className="font-bold text-white text-sm truncate">{activeChannel?.name || 'general'}</h3>
            <span className="hidden md:inline-block text-xs text-gray-400 border-l border-white/10 pl-2 ml-1 truncate">
              {activeChannel?.description || 'Study space lounge'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>42 Online</span>
            </div>

            <button
              onClick={() => setShowMemberSidebar(!showMemberSidebar)}
              className={`p-1.5 rounded-md text-gray-400 hover:text-white transition-colors cursor-pointer ${showMemberSidebar ? 'bg-white/10 text-white' : ''}`}
              title="Toggle Member List"
            >
              <Users size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT AREA: TEXT CHAT STREAM */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Channel Welcome Message */}
            <div className="py-6 border-b border-white/5 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#404249] flex items-center justify-center text-white">
                <Hash size={26} />
              </div>
              <h1 className="text-2xl font-bold text-white font-['Outfit']">
                {activeChannel?.name ? `Welcome to #${activeChannel.name}!` : 'No channel selected'}
              </h1>
              <p className="text-xs text-gray-400">
                {activeChannel?.description || 'This is the start of the channel. Ask questions, share notes, and collaborate.'}
              </p>
            </div>

              {/* Message List */}
              {channelMessages.map(msg => {
                const author = msg.profiles?.full_name || 'Student';
                const username = msg.profiles?.username || 'user';
                const college = msg.profiles?.college || 'DTU';
                const initials = author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30 PM';

                return (
                  <div key={msg.id} className="flex gap-3 group hover:bg-[#2E3035] p-2 rounded-xl transition-colors">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-md">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white hover:underline cursor-pointer">{author}</span>
                        <span className="text-[10px] bg-[#5865F2]/20 text-[#5865F2] px-1.5 py-0.2 rounded font-semibold">STUDENT</span>
                        <span className="text-[10px] text-gray-400">@{username}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">{ts}</span>
                      </div>

                      <p className="text-xs text-gray-200 leading-relaxed font-normal">{msg.content}</p>

                      {/* Reactions Row */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {msg.reactions?.map((react, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => addReaction(msg.id, react.emoji)}
                            className="flex items-center gap-1 bg-[#2B2D31] hover:bg-[#35373C] border border-white/10 px-2 py-0.5 rounded-md text-[11px] text-gray-300 transition-colors cursor-pointer"
                          >
                            <span>{react.emoji}</span>
                            <span className="font-bold text-indigo-400">{react.count}</span>
                          </button>
                        ))}

                        {/* Quick Reaction Picker on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                          {emojiOptions.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(msg.id, emoji)}
                              className="hover:scale-125 transition-transform text-xs cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Text Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#313338] border-t border-white/5">
              <div className="bg-[#383A40] rounded-xl px-4 py-2.5 flex items-center gap-3 border border-white/5 focus-within:border-[#5865F2] transition-colors">
                <input
                  type="text"
                  placeholder={`Message #${activeChannel?.name || 'general'}...`}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-8 h-8 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

      {/* 4. RIGHT MEMBER SIDEBAR (Collapsible) */}
      {showMemberSidebar && (
        <div className="w-60 bg-[#2B2D31] border-l border-white/5 p-4 flex flex-col gap-4 shrink-0 select-none overflow-y-auto hidden lg:flex">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} />
            <span>Online Peers (6)</span>
          </div>

          <div className="space-y-3">
            {mockMembers.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#35373C] transition-colors cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#2B2D31] ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'focus' ? 'bg-purple-500' : member.status === 'idle' ? 'bg-amber-500' : 'bg-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">{member.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{member.role}</div>
                </div>
                {member.inVoice && (
                  <Volume2 size={13} className="text-emerald-400 animate-pulse shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASSCODE MODAL */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#313338] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock size={18} className="text-amber-400" /> Private Room Access
              </h3>
              <button onClick={() => setIsPasscodeModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-300">
              Enter passcode for <strong>{targetPrivateComm?.name}</strong> (Demo passcode: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">1234</code>)
            </p>
            <form onSubmit={handleUnlockPrivateRoom} className="space-y-4">
              <input
                type="password"
                placeholder="Enter 4-digit passcode..."
                value={passcodeAttempt}
                onChange={e => setPasscodeAttempt(e.target.value)}
                className="w-full h-11 bg-[#1E1F22] border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-[#5865F2]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer"
                >
                  Unlock Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE HUB / CHANNEL MODAL */}
      {isCreateCommModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#313338] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create Study Community Hub</h3>
              <button onClick={() => setIsCreateCommModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCommunity} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithms & Data Structures"
                  value={newComm.name}
                  onChange={e => setNewComm({ ...newComm, name: e.target.value })}
                  className="w-full h-10 bg-[#1E1F22] border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Display Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="📚"
                  value={newComm.icon}
                  onChange={e => setNewComm({ ...newComm, icon: e.target.value })}
                  className="w-full h-10 bg-[#1E1F22] border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateCommModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer"
                >
                  Create Private Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN SERVER MODAL */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#313338] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Join Private Server</h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleJoinCommunity} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Room Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. X9F3A1"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full h-10 bg-[#1E1F22] border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-[#5865F2] uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer"
                >
                  Join Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
