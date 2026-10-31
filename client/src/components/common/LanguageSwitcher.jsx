import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ChevronDown, Globe } from 'lucide-react';

const languages = [
  { code: 'ar', label: 'العربية', short: 'عربي', codeLabel: 'AR', dir: 'rtl' },
  { code: 'fr', label: 'Français', short: 'FR', codeLabel: 'FR', dir: 'ltr' },
  { code: 'en', label: 'English', short: 'EN', codeLabel: 'EN', dir: 'ltr' },
];

export const LanguageSwitcher = ({ variant = 'buttons', className = '' }) => {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);

  const currentLangCode = i18n.language?.startsWith('fr')
    ? 'fr'
    : i18n.language?.startsWith('en')
    ? 'en'
    : 'ar';

  const currentLang = languages.find((l) => l.code === currentLangCode) || languages[0];

  const changeLanguage = async (code) => {
    i18n.changeLanguage(code);
    setOpen(false);

    if (user && user.preferredLanguage !== code) {
      try {
        const res = await api.put('/auth/profile', { preferredLanguage: code });
        if (res.data?.success && res.data.user) {
          updateUser(res.data.user);
        }
      } catch (err) {
        console.warn('Could not persist language to user profile:', err.message);
      }
    }
  };

  if (variant === 'buttons') {
    return (
      <div className={`inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner select-none ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            className={`
              px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all
              ${currentLangCode === lang.code
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }
            `}
            title={lang.label}
          >
            {lang.codeLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative select-none ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-500" />
        <span className="hidden xs:inline">{currentLang.label}</span>
        <span className="xs:hidden uppercase font-mono">{currentLang.codeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`
                  w-full px-3.5 py-2.5 text-start text-xs font-semibold flex items-center justify-between transition-colors
                  ${currentLangCode === lang.code
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span>{lang.label}</span>
                <span className="font-mono text-[10px] text-slate-400">[{lang.codeLabel}]</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
