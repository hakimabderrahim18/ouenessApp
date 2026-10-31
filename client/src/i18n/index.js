import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './ar.json';
import fr from './fr.json';
import en from './en.json';

const resources = {
  ar: { translation: ar },
  fr: { translation: fr },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'fr', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'loginaft_language',
      caches: ['localStorage'],
    },
  });

/**
 * Applies strict document layout direction and language code to root <html> tag.
 * Forces RTL for Arabic, LTR for French & English.
 */
export const applyLanguageDirection = (lng) => {
  const currentLang = lng || i18n.language || 'ar';
  const isRTL = currentLang === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;

  if (isRTL) {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }
};

// Initial sync on startup
applyLanguageDirection(i18n.language);

// Listen to language changes to update layout direction immediately without reload
i18n.on('languageChanged', (lng) => {
  applyLanguageDirection(lng);
  localStorage.setItem('loginaft_language', lng);
});

export default i18n;
