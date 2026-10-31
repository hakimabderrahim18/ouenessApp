import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

/**
 * Modern High-Impact Toast Notification Component
 */
export const Toast = ({
  type = 'info',
  title,
  message,
  timestamp,
  onDismiss,
  className = '',
}) => {
  const configs = {
    success: {
      border: 'border-emerald-500/30 dark:border-emerald-500/40',
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badge: 'Succès Opérationnel',
    },
    warning: {
      border: 'border-amber-500/30 dark:border-amber-500/40',
      bg: 'bg-amber-50/90 dark:bg-amber-950/40',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      badge: 'Avertissement Flotte/Stock',
    },
    danger: {
      border: 'border-rose-500/30 dark:border-rose-500/40',
      bg: 'bg-rose-50/90 dark:bg-rose-950/40',
      icon: AlertOctagon,
      iconColor: 'text-rose-500',
      badge: 'Alerte Critique Immédiate',
    },
    info: {
      border: 'border-cyan-500/30 dark:border-cyan-500/40',
      bg: 'bg-cyan-50/90 dark:bg-cyan-950/40',
      icon: Info,
      iconColor: 'text-cyan-500',
      badge: 'Notification Système',
    },
  }[type] || {
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-white dark:bg-slate-900',
    icon: Info,
    iconColor: 'text-slate-400',
    badge: 'Notification',
  };

  const Icon = configs.icon;

  return (
    <div
      className={`
        w-full max-w-md ${configs.bg} border ${configs.border}
        rounded-2xl p-4 shadow-lg backdrop-blur-md flex items-start gap-3.5 select-none text-start
        ${className}
      `}
      role="alert"
    >
      <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${configs.iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {configs.badge}
          </span>
          {timestamp && (
            <span className="font-mono text-[10px] text-slate-400">
              {timestamp}
            </span>
          )}
        </div>

        {title && (
          <h4 className="font-title font-bold text-sm text-slate-900 dark:text-white mt-0.5">
            {title}
          </h4>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
