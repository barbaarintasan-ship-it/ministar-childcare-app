import { translations } from '../constants/translations';

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(key, lang) {
  const l = lang || currentLang;
  return translations[l]?.[key] || translations.en[key] || key;
}

export function createTranslator(lang) {
  return (key) => translations[lang]?.[key] || translations.en[key] || key;
}
