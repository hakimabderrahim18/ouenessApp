import React from 'react';

/**
 * Modern High-Impact Badge & Status Indicators
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon: Icon,
  code,
  glow = false,
}) => {
  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5 rounded-full font-mono',
    sm: 'text-xs px-2.5 py-1 rounded-full font-medium',
    md: 'text-xs px-3 py-1.5 rounded-full font-semibold',
  }[size] || 'text-xs px-2.5 py-1 rounded-full font-medium';

  const variantClasses = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    petrol: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-semibold',
    safety: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-semibold',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold',
    info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold',
  }[variant] || variantClasses.neutral;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 select-none shrink-0 transition-all
        ${sizeClasses}
        ${variantClasses}
        ${glow ? 'shadow-sm ring-2 ring-current/10' : ''}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {code && <span className="font-bold opacity-75 font-mono">#{code}</span>}
      <span>{children}</span>
    </span>
  );
};

/**
 * Modern ADR Dangerous Goods Diamond Badge (Class 2 Gas / Class 3 Flammable Liquids)
 */
export const AdrDiamond = ({ classType = '3', label = 'CLASSE 3', subtext = 'LIQUIDE INFLAMMABLE', className = '' }) => {
  const isClass3 = classType.toString() === '3';

  return (
    <div className={`inline-flex items-center gap-2.5 border rounded-xl px-2.5 py-1.5 select-none shadow-sm ${
      isClass3 
        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
        : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300'
    } ${className}`}>
      {/* Outer Rotating Diamond with Gradient */}
      <div className={`relative w-6 h-6 flex items-center justify-center shrink-0 rotate-45 rounded-[3px] border shadow-sm ${
        isClass3 
          ? 'bg-gradient-to-tr from-rose-600 to-red-500 border-rose-300 text-white' 
          : 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-200 text-slate-900'
      }`}>
        <span className="-rotate-45 font-mono font-black text-xs leading-none">
          {classType}
        </span>
      </div>

      {/* ADR Technical Labels */}
      <div className="flex flex-col text-start leading-tight">
        <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
          ADR-{label}
        </span>
        {subtext && (
          <span className="text-[10px] opacity-75 font-medium">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default Badge;
