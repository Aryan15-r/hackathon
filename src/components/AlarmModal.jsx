import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Clock, CheckCircle2, Volume2, X, AlertTriangle } from 'lucide-react';

export default function AlarmModal() {
  const { triggeredAlarm, dismissAlarm, snoozeAlarm, playAlarmChime, toggleTask } = useApp();

  if (!triggeredAlarm) return null;

  const handleCompleteAndDismiss = () => {
    if (triggeredAlarm.task?.id) {
      toggleTask(triggeredAlarm.task.id, 'completed');
    }
    dismissAlarm();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[460px] bg-[#FAF8F5] dark:bg-[#1A1C23] border border-[#1E3A5F]/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Animated Alarm Header Banner */}
        <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2D4B73] to-[#D97706] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D97706]/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={dismissAlarm}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Dismiss Alarm"
          >
            <X size={16} />
          </button>

          {/* Pulsing Bell Icon */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center animate-ping absolute inset-0 opacity-40" />
            <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center relative shadow-lg">
              <Bell size={30} className="text-amber-300 animate-bounce" />
            </div>
          </div>

          <h2 className="text-xl font-bold font-['Outfit'] tracking-wide">
            {triggeredAlarm.snoozed ? '⏰ Snoozed Alarm Reminder' : '🔔 Task Alarm Alert!'}
          </h2>
          <p className="text-xs text-white/80 mt-1 font-mono">
            Scheduled Time: {triggeredAlarm.due_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Alarm Body */}
        <div className="p-6 space-y-5">
          <div className="bg-white dark:bg-[#232730] border border-black/5 dark:border-white/10 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-[#D97706] uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>{triggeredAlarm.category || 'Study Reminder'}</span>
            </div>
            <h3 className="text-base font-bold text-[#1A1A2E] dark:text-white leading-snug">
              {triggeredAlarm.title || 'Study Session Due'}
            </h3>
            {triggeredAlarm.description && (
              <p className="text-xs text-black/60 dark:text-white/70 mt-2 leading-relaxed">
                {triggeredAlarm.description}
              </p>
            )}
          </div>

          {/* Sound replay button */}
          <button
            onClick={playAlarmChime}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1E3A5F]/5 dark:bg-white/5 border border-[#1E3A5F]/15 dark:border-white/10 text-xs font-medium text-[#1E3A5F] dark:text-amber-300 hover:bg-[#1E3A5F]/10 transition-colors cursor-pointer"
          >
            <Volume2 size={15} />
            <span>Replay Chime Alert</span>
          </button>

          {/* Snooze Options */}
          <div>
            <label className="block text-xs font-semibold text-black/60 dark:text-white/60 mb-2 text-center uppercase tracking-wider">
              Snooze Reminder
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => snoozeAlarm(5)}
                className="py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-[#1A1A2E] dark:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Clock size={13} /> +5 min
              </button>
              <button
                onClick={() => snoozeAlarm(10)}
                className="py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-[#1A1A2E] dark:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Clock size={13} /> +10 min
              </button>
              <button
                onClick={() => snoozeAlarm(15)}
                className="py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-[#1A1A2E] dark:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Clock size={13} /> +15 min
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={dismissAlarm}
              className="flex-1 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold text-black/70 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleCompleteAndDismiss}
              className="flex-1 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152b46] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Mark Complete</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
