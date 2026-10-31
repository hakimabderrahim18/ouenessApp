import React from 'react';

/**
 * Modern High-Impact Table Components
 * Clean whitespace, rounded card container, subtle zebra hover, high contrast typography.
 */

export const Table = ({ children, className = '' }) => (
  <div className="w-full min-w-0 max-w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
    <table className={`w-full border-collapse text-start text-xs sm:text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', isHeader = false, onClick, selected = false }) => (
  <tr
    onClick={onClick}
    className={`
      ${isHeader ? 'h-11' : 'h-12 transition-colors duration-150'}
      ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}
      ${selected ? 'bg-cyan-50/70 dark:bg-cyan-950/30' : ''}
      ${className}
    `}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', align = 'start' }) => {
  const alignClass = {
    start: 'text-start',
    center: 'text-center',
    end: 'text-end',
  }[align] || 'text-start';

  return (
    <th
      className={`
        px-4 py-3 font-title text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400
        select-none whitespace-nowrap
        ${alignClass} ${className}
      `}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', align = 'start', mono = false }) => {
  const alignClass = {
    start: 'text-start',
    center: 'text-center',
    end: 'text-end',
  }[align] || 'text-start';

  return (
    <td
      className={`
        px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap
        ${mono ? 'font-mono text-xs font-medium' : ''}
        ${alignClass} ${className}
      `}
    >
      {children}
    </td>
  );
};

export const TableEmpty = ({ message = 'Aucun enregistrement trouvé', colSpan = 6 }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium text-sm">
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-2xl opacity-50">📂</span>
        <span>{message}</span>
      </div>
    </td>
  </tr>
);

export default Table;
