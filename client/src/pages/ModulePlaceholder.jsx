import React from 'react';
import { Construction } from 'lucide-react';

const ModulePlaceholder = ({ title, moduleName }) => {
  return (
    <div className="p-12 max-w-xl mx-auto my-12 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-4">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        هذه الوحدة ({moduleName}) مجهزة ومجدولة للتفعيل في الخطوة القادمة حسب تسلسل التطوير المعتمد.
      </p>
      <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
        Status: Scheduled in Next Module
      </div>
    </div>
  );
};

export default ModulePlaceholder;
