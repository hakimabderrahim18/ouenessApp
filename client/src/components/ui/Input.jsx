import React from 'react';

/**
 * Modern High-Impact Input Component with unit chip and crisp styling
 */
export const Input = ({
  label,
  unit,
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  required = false,
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 text-start ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {unit && !props.value && (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 lowercase">[{unit}]</span>
          )}
        </label>
      )}

      <div className="relative flex items-stretch">
        {Icon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`
            w-full bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border rounded-xl text-xs sm:text-sm font-medium
            px-3.5 py-2.5 transition-all duration-200 shadow-sm
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15
            disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed
            ${Icon ? 'ps-10' : ''}
            ${unit ? 'pe-14' : ''}
            ${error 
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200' 
              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'}
            ${className}
          `}
          {...props}
        />

        {unit && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {unit}
            </span>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5 font-medium">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Select = ({
  label,
  error,
  children,
  className = '',
  containerClassName = '',
  required = false,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 text-start ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={`
          w-full bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border rounded-xl text-xs sm:text-sm font-medium
          px-3.5 py-2.5 transition-all duration-200 shadow-sm cursor-pointer
          focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15
          disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error 
            ? 'border-rose-400 focus:border-rose-500' 
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5 font-medium">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Input;
