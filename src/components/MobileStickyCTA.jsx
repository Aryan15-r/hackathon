import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Bot, CheckSquare, UserCheck, MessageSquare } from 'lucide-react';

export default function MobileStickyCTA() {
  const { activeTab, setActiveTab, tasks } = useApp();
  const pendingCount = tasks.filter(t => !t.completed).length;

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Tutor', icon: Bot, highlight: true },
    { id: 'todo', label: 'Tasks', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'attendance', label: 'Tracker', icon: UserCheck },
    { id: 'community', label: 'Hub', icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1E3A5F]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map(({ id, label, icon: Icon, highlight, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-300 font-bold scale-105'
                  : highlight
                  ? 'text-amber-400 font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${highlight && !isActive ? 'bg-amber-500/20' : ''}`}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] tracking-tight">{label}</span>
              {badge && (
                <span className="absolute -top-1 right-1 bg-amber-500 text-[#1E3A5F] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#1E3A5F]">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
