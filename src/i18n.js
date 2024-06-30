import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationVN from './locales/vn/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  vn: {
    translation: translationVN
  }
};

const savedLanguage = localStorage.getItem('language') || 'vn';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // default language
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      wait: true,
    },
  });

export default i18n;
