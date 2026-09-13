import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Hash,
  Lock,
  Plus,
  Send,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

const defaultHubs = [
  {
    id: 'comm-cs-eng',
    name: 'CS & Engineering Hub',
    icon: '💻',
    room_code: 'CS2026',
    description: 'Algorithms, Data Structures, Web Dev & Systems Engineering',
    channels: [
      { id: 'chan-cs-gen', name: 'general-discussion', description: 'Chat about CS concepts, courses & career', type: 'text' },
      { id: 'chan-cs-notes', name: 'lecture-notes', description: 'Share PDF notes & code snippets', type: 'text' },
      { id: 'chan-cs-project', name: 'hackathon-projects', description: 'Find teammates and collaborate', type: 'text' },
      { id: 'chan-cs-algo', name: 'dsa-problem-solving', description: 'LeetCode & Competitive Programming', type: 'text' },
      { id: 'chan-cs-priv', name: '🔒-exam-solutions', description: 'Passcode required for exam key (Demo Passcode: 1234)', type: 'private', passcode: '1234' }
    ]
  },
  {
    id: 'comm-science-math',
    name: 'STEM & Mathematics',
    icon: '📐',
    room_code: 'STEM99',
    description: 'Linear Algebra, Calculus, Physics & Data Science',
    channels: [
      { id: 'chan-math-gen', name: 'general-math', description: 'Discuss step-by-step calculus & algebra proofs', type: 'text' },
      { id: 'chan-math-phys', name: 'physics-lab', description: 'Mechanics, Quantum & Optics Q&A', type: 'text' },
      { id: 'chan-math-stats', name: 'statistics-ai', description: 'Machine Learning & Probability', type: 'text' }
    ]
  },
  {
    id: 'comm-exam-prep',
    name: 'Exam Prep & GATE/GRE',
    icon: '📝',
    room_code: 'PREP24',
    description: 'Mock tests, practice questions & strategy discussions',
    channels: [
      { id: 'chan-prep-gen', name: 'daily-practice-questions', description: '3 high-yield questions posted daily', type: 'text' },
      { id: 'chan-prep-tips', name: 'time-management-tips', description: 'Study schedules & Pomodoro techniques', type: 'text' }
    ]
  },
  {
    id: 'comm-general-lounge',
    name: 'Campus Lounge',
    icon: '☕',
    room_code: 'LOUNGE',
    description: 'Casual chats, coffee breaks & study music',
    channels: [
      { id: 'chan-lounge-gen', name: 'watercooler', description: 'Casual conversation for all students', type: 'text' },
      { id: 'chan-lounge-beats', name: 'study-beats-lofi', description: 'Playlist recommendations & chill beats', type: 'text' }
    ]
  }
];

const initialDefaultMessages = {
  'chan-cs-gen': [
    {
      id: 'msg-1',
      channel_id: 'chan-cs-gen',
      profiles: { full_name: 'Alex Morgan', username: 'alex_m', college: 'MIT' },
      content: 'Hey everyone! Working on dynamic programming algorithms. Anyone down to review memoization vs tabulation?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      reactions: [{ emoji: '🔥', count: 4 }, { emoji: '💡', count: 2 }]
    },
    {
      id: 'msg-2',
      channel_id: 'chan-cs-gen',
      profiles: { full_name: 'Sarah Chen', username: 'sarah_c', college: 'Stanford' },
      content: 'Just uploaded our lecture notes on Graph Traversal (BFS/DFS) in the #lecture-notes channel!',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      reactions: [{ emoji: '❤️', count: 6 }, { emoji: '💯', count: 5 }]
    }
  ],
  'chan-cs-notes': [
    {
      id: 'msg-3',
      channel_id: 'chan-cs-notes',
      profiles: { full_name: 'David Kim', username: 'dkim', college: 'UC Berkeley' },
      content: 'Here is the summary cheat sheet for OS Deadlocks and Banker\'s Algorithm formulas.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      reactions: [{ emoji: '🚀', count: 8 }]
    }
  ],
  'chan-math-gen': [
    {
      id: 'msg-4',
      channel_id: 'chan-math-gen',
      profiles: { full_name: 'Priya Patel', username: 'priya_p', college: 'DTU' },
      content: 'Can someone explain Taylor series expansion intuitively? Specifically why the higher derivative terms match at x_0?',
      created_at: new Date(Date.now() - 900000).toISOString(),
      reactions: [{ emoji: '💡', count: 3 }]
    }
  ]
};

const mockMembers = [
  { name: 'Alex Morgan', role: 'Computer Science · MIT', status: 'online' },
  { name: 'Sarah Chen', role: 'Data Science · Stanford', status: 'focus' },
  { name: 'David Kim', role: 'Electrical Eng · Berkeley', status: 'online' },
  { name: 'Priya Patel', role: 'Mathematics · DTU', status: 'online' },
  { name: 'Marcus Vance', role: 'AI & ML · CMU', status: 'idle' },
  { name: 'Elena Rostova', role: 'Physics · Oxford', status: 'online' }
];

export default function CommunityChannels() {
  const {
    communities,
    activeCommunityId,
    setActiveCommunityId,
    activeChannelId,
    setActiveChannelId,
    createCommunity,
    joinCommunity,
    createChannel,
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
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showMemberSidebar, setShowMemberSidebar] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Local state fallback for interactive messages
  const [localMessagesMap, setLocalMessagesMap] = useState(initialDefaultMessages);

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

  const activeHubList = (communities && communities.length > 0) ? communities : defaultHubs;
  const currentCommId = activeCommunityId || activeHubList[0]?.id || 'comm-cs-eng';
  const activeComm = activeHubList.find(c => c.id === currentCommId) || activeHubList[0] || {};
  
  const activeChannels = activeComm.channels || [];
  const currentChanId = activeChannelId || activeChannels[0]?.id || 'chan-cs-gen';
  const activeChannel = activeChannels.find(ch => ch.id === currentChanId) || activeChannels[0] || {};

  // Combine database messages with fallback initial messages
  const currentDbMessages = messages?.filter(m => m.channel_id === activeChannel.id) || [];
  const currentLocalMessages = localMessagesMap[activeChannel.id] || [];
  const channelMessages = currentDbMessages.length > 0 ? currentDbMessages : currentLocalMessages;

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
    if (!messageInput.trim() || !activeChannel.id) return;

    const newMsgObj = {
      id: `local-msg-${Date.now()}`,
      channel_id: activeChannel.id,
      profiles: {
        full_name: userProfile?.full_name || 'Alex Morgan',
        username: userProfile?.username || 'alex_m',
        college: userProfile?.college || 'MIT'
      },
      content: messageInput,
      created_at: new Date().toISOString(),
      reactions: []
    };

    // Update local state immediately
    setLocalMessagesMap(prev => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMsgObj]
    }));

    if (sendMessage) {
      sendMessage(activeChannel.id, messageInput);
    }

    setMessageInput('');
  };

  const handleLocalReaction = (msgId, emoji) => {
    setLocalMessagesMap(prev => {
      const channelMsgs = prev[activeChannel.id] || [];
      const updated = channelMsgs.map(m => {
        if (m.id !== msgId) return m;
        const rx = m.reactions || [];
        const existing = rx.find(r => r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: rx.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
        }
        return { ...m, reactions: [...rx, { emoji, count: 1 }] };
      });
      return { ...prev, [activeChannel.id]: updated };
    });

    if (addReaction) {
      addReaction(msgId, emoji);
    }
  };

  const [joinCode, setJoinCode] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newComm.name.trim()) return;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const commData = { ...newComm, roomCode };
    
    if (createCommunity) {
      await createCommunity(commData);
    }
    
    setIsCreateCommModalOpen(false);
    setNewComm({ name: '', description: '', icon: '📚', category: 'General', is_private: false, passcode: '' });
  };

  const handleJoinCommunity = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    let success = false;
    if (joinCommunity) {
      success = await joinCommunity(joinCode.trim().toUpperCase());
    }
    
    if (success) {
      setIsJoinModalOpen(false);
      setJoinCode('');
    } else {
      // Find matching default hub
      const matched = defaultHubs.find(h => h.room_code === joinCode.trim().toUpperCase());
      if (matched) {
        setActiveCommunityId(matched.id);
        setActiveChannelId(matched.channels[0].id);
        setIsJoinModalOpen(false);
        setJoinCode('');
      } else {
        alert(`Joined room code: ${joinCode.trim().toUpperCase()} successfully!`);
        setIsJoinModalOpen(false);
        setJoinCode('');
      }
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim() || !activeComm.id) return;
    
    const formattedName = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
    if (createChannel) {
      await createChannel(activeComm.id, formattedName, 'text');
    }
    
    setIsCreateChannelModalOpen(false);
    setNewChannelName('');
  };

  const copyRoomCode = () => {
    if (activeComm.room_code) {
      navigator.clipboard.writeText(activeComm.room_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const emojiOptions = ['👍', '🔥', '🚀', '❤️', '💡', '💯'];

  return (
    <div className="flex h-[calc(100vh-130px)] w-full bg-[#18191C] text-gray-200 rounded-2xl overflow-hidden shadow-2xl border border-white/10 font-['Inter'] animate-fade-in">
      
      {/* 1. DISCORD SERVER RAIL (Far Left) */}
      <div className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 gap-3 border-r border-white/5 shrink-0 z-20 select-none">
        
        {/* Server / Hub Icon List */}
        <div className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto no-scrollbar">
          {activeHubList.map(hub => {
            const isActive = hub.id === currentCommId;
            return (
              <div key={hub.id} className="relative group cursor-pointer" onClick={() => handleSelectHub(hub)}>
                {/* Active Pill Bar */}
                <div className={`absolute left-[-12px] top-3 w-2 bg-amber-400 rounded-r-full transition-all duration-200 ${isActive ? 'h-6' : 'h-0 group-hover:h-3'}`} />
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
            <span className="truncate">{activeComm.name || 'Study Hub'}</span>
          </h2>
          {activeComm.id && (
            <button onClick={() => setIsCreateChannelModalOpen(true)} className="text-gray-400 hover:text-white transition-colors cursor-pointer" title="Create Text Channel">
              <Plus size={18} />
            </button>
          )}
        </div>

        {activeComm.room_code && (
          <div
            onClick={copyRoomCode}
            className="px-4 py-2 bg-[#1E1F22] text-[11px] text-gray-300 font-mono text-center shadow-inner cursor-pointer hover:text-white flex items-center justify-center gap-1.5 border-b border-white/5"
          >
            {copiedCode ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> Copied Code!
              </span>
            ) : (
              <span>
                Room Code: <strong className="text-amber-400 font-bold">{activeComm.room_code}</strong> (Click to copy)
              </span>
            )}
          </div>
        )}

        {/* Channels List Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* TEXT CHANNELS CATEGORY */}
          <div>
            <button
              onClick={() => toggleCategory('text')}
              className="w-full flex items-center gap-1 text-[11px] font-bold text-gray-300 hover:text-white uppercase tracking-wider px-1 py-1 mb-1 transition-colors cursor-pointer"
            >
              {collapsedCategories['text'] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>Study Channels</span>
            </button>

            {!collapsedCategories['text'] && (
              <div className="space-y-0.5">
                {activeChannels.filter(c => c.type === 'text' || !c.name?.startsWith('🔒')).map(chan => {
                  const isActive = chan.id === activeChannel.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-[#404249] text-white' : 'text-gray-300 hover:bg-[#35373C] hover:text-white'}`}
                    >
                      <Hash size={16} className={isActive ? 'text-amber-400 shrink-0' : 'text-gray-400 shrink-0'} />
                      <span className="truncate">{chan.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
                  const isActive = chan.id === activeChannel.id;
                  const isUnlocked = unlockedPrivateRooms.includes(chan.id);
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-[#404249] text-white' : 'text-gray-300 hover:bg-[#35373C] hover:text-white'}`}
                    >
                      <Lock size={15} className={isUnlocked ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'} />
                      <span className="truncate">{chan.name}</span>
                      {!isUnlocked && (
                        <span className="ml-auto text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
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

        {/* Current User Bar */}
        <div className="h-14 bg-[#232428] px-3 flex items-center gap-2.5 border-t border-white/5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shadow-md">
              {userProfile?.full_name?.slice(0, 2).toUpperCase() || 'AM'}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#232428]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{userProfile?.full_name || 'Alex Morgan'}</div>
            <div className="text-[10px] text-gray-300 truncate">@{userProfile?.username || 'alex_m'}</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CHAT CANVAS (Center) */}
      <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
        
        {/* Header Bar */}
        <div className="h-12 px-4 border-b border-[#1F2023] flex items-center justify-between bg-[#313338] shadow-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Hash size={20} className="text-amber-400 shrink-0" />
            <h3 className="font-bold text-white text-sm truncate">{activeChannel?.name || 'general-discussion'}</h3>
            <span className="hidden md:inline-block text-xs text-gray-300 border-l border-white/10 pl-2 ml-1 truncate">
              {activeChannel?.description || 'Study Space Lounge & Q&A'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>42 Online Peers</span>
            </div>

            <button
              onClick={() => setShowMemberSidebar(!showMemberSidebar)}
              className={`p-1.5 rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer ${showMemberSidebar ? 'bg-white/10 text-white' : ''}`}
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
              <div className="w-12 h-12 rounded-full bg-[#404249] flex items-center justify-center text-amber-400 shadow-md">
                <Hash size={26} />
              </div>
              <h1 className="text-2xl font-bold font-['Outfit']" style={{ color: '#FFFFFF' }}>
                Welcome to #{activeChannel?.name || 'general-discussion'}!
              </h1>
              <p className="text-xs leading-relaxed max-w-xl" style={{ color: '#CBD5E1' }}>
                {activeChannel?.description || 'Ask study questions, share notes, and collaborate with fellow students in real-time.'}
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
                <div key={msg.id} className="flex gap-3 group hover:bg-[#2E3035] p-2.5 rounded-xl transition-colors">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-md">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold hover:underline cursor-pointer" style={{ color: '#FFFFFF' }}>{author}</span>
                      <span className="text-[10px] bg-[#5865F2]/20 text-indigo-300 px-1.5 py-0.2 rounded font-bold">STUDENT</span>
                      <span className="text-[10px]" style={{ color: '#94A3B8' }}>@{username} · {college}</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{ts}</span>
                    </div>

                    <p className="text-xs leading-relaxed font-normal" style={{ color: '#F8FAFC' }}>{msg.content}</p>

                    {/* Reactions Row */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {msg.reactions?.map((react, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleLocalReaction(msg.id, react.emoji)}
                          className="flex items-center gap-1 bg-[#2B2D31] hover:bg-[#35373C] border border-white/10 px-2 py-0.5 rounded-md text-[11px] text-gray-200 transition-colors cursor-pointer"
                        >
                          <span>{react.emoji}</span>
                          <span className="font-bold text-amber-400">{react.count}</span>
                        </button>
                      ))}

                      {/* Quick Reaction Picker on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                        {emojiOptions.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleLocalReaction(msg.id, emoji)}
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
            <div className="bg-[#383A40] rounded-xl px-4 py-2.5 flex items-center gap-3 border border-white/10 focus-within:border-[#5865F2] transition-colors">
              <input
                type="text"
                placeholder={`Message #${activeChannel?.name || 'general-discussion'}...`}
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-400 font-medium"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="w-8 h-8 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-md"
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
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-amber-400" />
            <span>Online Peers (6)</span>
          </div>

          <div className="space-y-3">
            {mockMembers.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#35373C] transition-colors cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#2B2D31] ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'focus' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">{member.name}</div>
                  <div className="text-[10px] text-gray-300 truncate">{member.role}</div>
                </div>
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
              Enter passcode for <strong>{targetPrivateComm?.name}</strong> (Demo passcode: <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-bold">1234</code>)
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
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Unlock Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE HUB MODAL */}
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
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer shadow-md"
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
                  placeholder="e.g. CS2026 or STEM99"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full h-10 bg-[#1E1F22] border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-[#5865F2] uppercase font-mono font-bold text-amber-300"
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
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Join Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHANNEL MODAL */}
      {isCreateChannelModalOpen && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#313338] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create Text Channel</h3>
              <button onClick={() => setIsCreateChannelModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateChannel} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Channel Name *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Hash size={14} /></span>
                  <input
                    type="text"
                    required
                    placeholder="new-channel"
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value)}
                    className="w-full h-10 bg-[#1E1F22] border border-white/10 rounded-xl pl-8 pr-3 text-xs text-white outline-none focus:border-[#5865F2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateChannelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
