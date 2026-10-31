import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borderMap: Record<ToastType, string> = {
    success: 'border-emerald-300 bg-white/98 text-slate-900 shadow-xl shadow-emerald-500/5',
    error: 'border-rose-300 bg-white/98 text-slate-900 shadow-xl shadow-rose-500/5',
    warning: 'border-amber-300 bg-white/98 text-slate-900 shadow-xl shadow-amber-500/5',
    info: 'border-sky-300 bg-white/98 text-slate-900 shadow-xl shadow-sky-500/5',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-5 ${borderMap[t.type]}`}
        >
          {iconMap[t.type]}
          <div className="flex-1">
            {t.title && <h4 className="text-xs font-bold text-slate-950 mb-0.5">{t.title}</h4>}
            <p className="text-xs text-slate-700 leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
