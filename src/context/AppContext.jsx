import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('studyspace_theme') || 'dark');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('studyspace_user_profile');
    return saved ? JSON.parse(saved) : {
      username: 'aryan_dev',
      fullName: 'Aryan Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      college: 'Delhi Technological University (DTU)',
      branch: 'Computer Science & Engineering',
      year: 3,
      bio: 'B.Tech CSE | AI & Web Developer | Lifelong Learner'
    };
  });

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Community Channels State
  const [communities, setCommunities] = useState([]);
  const [activeCommunityId, setActiveCommunityId] = useState('comm-1');
  const [activeChannelId, setActiveChannelId] = useState('chan-1');
  const [messages, setMessages] = useState([]);

  // AI Chat History
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'model',
      text: '👋 Hi Aryan! I am **StudySpace AI**, your zero-downtime academic assistant powered by Google Gemini. Ask me any conceptual doubt, request practice problems, or upload a paper summary!'
    }
  ]);
  const [aiModelUsed, setAiModelUsed] = useState('gemini-3.6-flash');

  // Focus / Pomodoro Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1500); // 25 min default
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(3);
  const [totalFocusedSecondsToday, setTotalFocusedSecondsToday] = useState(5400); // 90 min initial

  // Sync theme changes with body class
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('studyspace_theme', theme);
  }, [theme]);

  // Sync profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('studyspace_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Initial Data Fetching from Node Backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

        // Fetch communities
        const commRes = await fetch('/api/community');
        if (commRes.ok) {
          const commData = await commRes.json();
          setCommunities(commData.communities || []);
          setMessages(commData.messages || []);
        }
      } catch (err) {
        console.warn('Backend API connection warning (running with local fallbacks):', err);
      } finally {
        setTasksLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Pomodoro Interval Effect
  useEffect(() => {
    let interval = null;
    if (pomodoroIsRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
        if (pomodoroMode === 'work') {
          setTotalFocusedSecondsToday(prev => prev + 1);
        }
      }, 1000);
    } else if (pomodoroSeconds === 0 && pomodoroIsRunning) {
      setPomodoroIsRunning(false);
      if (pomodoroMode === 'work') {
        setCompletedSessions(prev => prev + 1);
        alert('🎉 Focus Session Completed! Time for a break.');
      } else {
        alert('🔔 Break completed! Ready to study?');
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, pomodoroSeconds, pomodoroMode]);

  // Task Actions
  const addTask = async (newTaskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      });
      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [created, ...prev]);
        return created;
      }
    } catch (e) {
      // Fallback local
      const localTask = {
        id: `task-${Date.now()}`,
        ...newTaskData,
        completed: false,
        created_at: new Date().toISOString()
      };
      setTasks(prev => [localTask, ...prev]);
      return localTask;
    }
  };

  const toggleTask = async (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const updatedCompleted = !target.completed;

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updatedCompleted } : t));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompleted })
      });
    } catch (e) {
      // Swallowed for offline
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Swallowed for offline
    }
  };

  // Community Actions
  const sendMessage = async (channelId, text) => {
    const msgPayload = {
      channel_id: channelId,
      content: text,
      user: {
        full_name: userProfile.fullName,
        username: userProfile.username,
        college: userProfile.college,
        avatar_url: userProfile.avatarUrl
      }
    };

    try {
      const res = await fetch('/api/community/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload)
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        return;
      }
    } catch (e) {
      // Offline fallback
    }

    const localMsg = {
      id: `msg-${Date.now()}`,
      channel_id: channelId,
      user: msgPayload.user,
      content: text,
      created_at: new Date().toISOString(),
      reactions: []
    };
    setMessages(prev => [...prev, localMsg]);
  };

  const addReaction = async (messageId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const existing = m.reactions.find(r => r.emoji === emoji);
        let newReactions;
        if (existing) {
          newReactions = m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
        } else {
          newReactions = [...m.reactions, { emoji, count: 1, users: ['me'] }];
        }
        return { ...m, reactions: newReactions };
      }
      return m;
    }));

    try {
      await fetch('/api/community/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, emoji })
      });
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      theme,
      toggleTheme,
      userProfile,
      setUserProfile,
      isProfileModalOpen,
      setIsProfileModalOpen,
      tasks,
      tasksLoading,
      addTask,
      toggleTask,
      deleteTask,
      communities,
      setCommunities,
      activeCommunityId,
      setActiveCommunityId,
      activeChannelId,
      setActiveChannelId,
      messages,
      sendMessage,
      addReaction,
      aiHistory,
      setAiHistory,
      aiModelUsed,
      setAiModelUsed,
      pomodoroSeconds,
      setPomodoroSeconds,
      pomodoroIsRunning,
      setPomodoroIsRunning,
      pomodoroMode,
      setPomodoroMode,
      completedSessions,
      totalFocusedSecondsToday
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
