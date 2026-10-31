import React from 'react';

/**
 * Modern High-Impact Button Component
 * Rounded corners, vibrant energy color palette, subtle elevation and tactile feedback.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  icon: Icon,
  iconPosition = 'start',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-title font-semibold tracking-wide transition-all duration-200 focus:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm';

  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg h-7 font-medium',
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg h-8',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 rounded-xl h-10',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 rounded-xl h-12',
    touch: 'text-base px-6 py-4 gap-3 rounded-2xl h-14 font-bold shadow-md', // Field mobile driver terminal
  };

  const variantClasses = {
    // Electric Azure / Cyan gradient with eye-popping impact
    primary: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-400 text-white shadow-cyan/25 hover:shadow-cyan/40 border border-cyan-400/30',
    // Algerian Emerald Green (Energy & Success)
    emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald/25 hover:shadow-emerald/40 border border-emerald-400/30',
    // Flame Safety Orange (Emergency / Dispatch actions)
    safety: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-orange/25 hover:shadow-orange/40 border border-orange-400/30',
    // Modern Clean Secondary
    secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm',
    // Outlined
    outline: 'bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
    // Critical Action
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm border border-red-500/30',
    // Minimal Ghost
    ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent shadow-none',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'start' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'end' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
