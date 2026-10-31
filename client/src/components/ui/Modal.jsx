import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modern High-Impact Modal Window Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  reference,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Color Accent */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/70 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 select-none">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
            <h3 className="font-title font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {title}
            </h3>
            {reference && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                REF: {reference}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Fermer (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 text-start">
          {children}
        </div>

        {/* Modal Actions Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
