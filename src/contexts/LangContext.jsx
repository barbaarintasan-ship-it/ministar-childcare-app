import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LangContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('app_language').then((saved) => {
      if (saved && translations[saved]) setLangState(saved);
    });
  }, []);

  const setLang = async (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      await AsyncStorage.setItem('app_language', newLang);
    }
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export { LangContext };
