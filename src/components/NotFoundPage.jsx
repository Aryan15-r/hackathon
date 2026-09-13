import React from 'react';
import { GraduationCap, ArrowLeft, Home, Bot, Search } from 'lucide-react';

export default function NotFoundPage({ onGoHome }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-[#1E3A5F] flex items-center justify-center mb-6 shadow-inner">
        <GraduationCap size={48} className="animate-bounce" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold text-xs uppercase tracking-widest mb-3">
        Error 404
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] font-['Outfit'] mb-3">
        Page or Resource Not Found
      </h1>

      <p className="text-sm text-[#6B7280] max-w-md mb-8 leading-relaxed">
        The study path, document, or channel you are looking for does not exist or has been relocated to a different workspace section.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onGoHome}
          className="px-6 py-3 rounded-2xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <Home size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="mt-12 pt-8 border-t border-[#1E3A5F]/10 w-full max-w-sm">
        <p className="text-xs text-[#6B7280] mb-3">Quick Navigation Shortcuts</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onGoHome('ai-assistant')}
            className="p-2.5 rounded-xl border border-[#1E3A5F]/10 bg-white hover:bg-[#FDF6EC] text-[#1A1A2E] font-medium flex items-center gap-2"
          >
            <Bot size={14} className="text-amber-600" /> AI Assistant
          </button>
          <button
            onClick={() => onGoHome('academic-search')}
            className="p-2.5 rounded-xl border border-[#1E3A5F]/10 bg-white hover:bg-[#FDF6EC] text-[#1A1A2E] font-medium flex items-center gap-2"
          >
            <Search size={14} className="text-[#1E3A5F]" /> Search Papers
          </button>
        </div>
      </div>
    </div>
  );
}
