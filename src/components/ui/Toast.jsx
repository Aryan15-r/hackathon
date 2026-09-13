import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', title, message, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={20} className="text-rose-500 shrink-0" />,
    info: <Info size={20} className="text-sky-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#1E3A5F] text-white shadow-2xl border border-white/10 backdrop-blur-md">
        {icons[type]}
        <div className="flex-1 pr-2">
          {title && <h4 className="font-bold text-sm text-white font-['Outfit']">{title}</h4>}
          <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
