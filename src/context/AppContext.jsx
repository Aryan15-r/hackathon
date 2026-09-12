import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  // ── Auth ─────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // ── Navigation ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ── Tasks ─────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // ── Community ─────────────────────────────────────────────────────────
  const [communities, setCommunities] = useState([]);
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ── AI Chat ───────────────────────────────────────────────────────────
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'model',
      text: '👋 Hi! I am **StudySpace AI**, your academic assistant powered by Google Gemini. Ask me any conceptual doubt, request practice problems, or upload a paper summary!'
    }
  ]);
  const [aiModelUsed, setAiModelUsed] = useState('gemini-flash');

  // ── Pomodoro ──────────────────────────────────────────────────────────
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1500);
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusedSecondsToday, setTotalFocusedSecondsToday] = useState(0);

  // ─────────────────────────────────────────────────────────────────────
  // Auth listener — runs once on mount
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setTasks([]);
        setCommunities([]);
        setMessages([]);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Load data when session is established
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (session) {
      loadTasks();
      loadCommunities();
      loadStudyStats();
    }
  }, [session]);

  // ─────────────────────────────────────────────────────────────────────
  // Fetch / update profile
  // ─────────────────────────────────────────────────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) setUserProfile(data);
    setAuthLoading(false);
  };

  const updateProfile = async (updates) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
      .select()
      .single();
    if (!error && data) setUserProfile(data);
    return { data, error };
  };

  // ─────────────────────────────────────────────────────────────────────
  // Tasks
  // ─────────────────────────────────────────────────────────────────────
  const loadTasks = async () => {
    if (!session) return;
    setTasksLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error) setTasks(data || []);
    setTasksLoading(false);
  };

  const addTask = async (newTaskData) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...newTaskData, user_id: session.user.id })
      .select()
      .single();
    if (!error && data) setTasks(prev => [data, ...prev]);
    return data;
  };

  const toggleTask = async (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const updatedCompleted = !target.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updatedCompleted } : t));
    await supabase.from('tasks').update({ completed: updatedCompleted, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Communities & Channels
  // ─────────────────────────────────────────────────────────────────────
  const loadCommunities = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*, channels(*)')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setCommunities(data);
      if (data.length > 0) {
        setActiveCommunityId(data[0].id);
        if (data[0].channels?.length > 0) {
          setActiveChannelId(data[0].channels[0].id);
        }
      }
    }
  };

  const loadMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(id, full_name, username, avatar_url, college)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (!error) setMessages(data || []);
  }, []);

  // Load messages whenever active channel changes
  useEffect(() => {
    if (activeChannelId) loadMessages(activeChannelId);
  }, [activeChannelId, loadMessages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeChannelId) return;

    const channel = supabase
      .channel(`messages:${activeChannelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannelId}` },
        async (payload) => {
          // Fetch the inserted message with profile join
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(id, full_name, username, avatar_url, college)')
            .eq('id', payload.new.id)
            .single();
          if (data) setMessages(prev => [...prev, data]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChannelId]);

  const sendMessage = async (channelId, text) => {
    if (!session) return;
    await supabase.from('messages').insert({
      channel_id: channelId,
      user_id: session.user.id,
      content: text,
    });
    // Realtime subscription handles UI update
  };

  const addReaction = async (messageId, emoji) => {
    if (!session) return;
    // Optimistic toggle in UI
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const reactions = m.reactions || [];
      const existing = reactions.find(r => r.emoji === emoji);
      if (existing) {
        return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
      }
      return { ...m, reactions: [...reactions, { emoji, count: 1 }] };
    }));

    // Upsert into DB (unique constraint handles duplicates)
    await supabase.from('message_reactions').upsert({
      message_id: messageId,
      user_id: session.user.id,
      emoji,
    }, { onConflict: 'message_id,user_id,emoji' });
  };

  // ─────────────────────────────────────────────────────────────────────
  // Study Stats (Pomodoro persistence)
  // ─────────────────────────────────────────────────────────────────────
  const loadStudyStats = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('study_tracker_states')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      const today = new Date().toISOString().split('T')[0];
      if (data.last_active_date === today) {
        setCompletedSessions(data.completed_sessions_today || 0);
        setTotalFocusedSecondsToday(data.total_focus_seconds_today || 0);
      }
      // If last_active_date is not today, stats reset to 0 (already default)
    }
  };

  const persistStudyStats = useCallback(async (sessions, focusSecs) => {
    if (!session) return;
    await supabase.from('study_tracker_states').upsert({
      user_id: session.user.id,
      completed_sessions_today: sessions,
      total_focus_seconds_today: focusSecs,
      last_active_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [session]);

  // ─────────────────────────────────────────────────────────────────────
  // Pomodoro Interval
  // ─────────────────────────────────────────────────────────────────────
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
        const newSessions = completedSessions + 1;
        setCompletedSessions(newSessions);
        persistStudyStats(newSessions, totalFocusedSecondsToday);
        alert('🎉 Focus Session Completed! Time for a break.');
      } else {
        alert('🔔 Break completed! Ready to study?');
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, pomodoroSeconds, pomodoroMode, completedSessions, totalFocusedSecondsToday, persistStudyStats]);

  // ─────────────────────────────────────────────────────────────────────
  // Auth Actions
  // ─────────────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ─────────────────────────────────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      // Auth
      session,
      authLoading,
      signOut,
      // Profile
      userProfile,
      setUserProfile,
      updateProfile,
      // Navigation
      activeTab,
      setActiveTab,
      isProfileModalOpen,
      setIsProfileModalOpen,
      // Tasks
      tasks,
      tasksLoading,
      addTask,
      toggleTask,
      deleteTask,
      loadTasks,
      // Community
      communities,
      setCommunities,
      activeCommunityId,
      setActiveCommunityId,
      activeChannelId,
      setActiveChannelId,
      messages,
      sendMessage,
      addReaction,
      // AI
      aiHistory,
      setAiHistory,
      aiModelUsed,
      setAiModelUsed,
      // Pomodoro
      pomodoroSeconds,
      setPomodoroSeconds,
      pomodoroIsRunning,
      setPomodoroIsRunning,
      pomodoroMode,
      setPomodoroMode,
      completedSessions,
      totalFocusedSecondsToday,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
