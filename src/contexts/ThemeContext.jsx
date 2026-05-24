import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  setDark: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme_preference').then((val) => {
      if (val === 'dark') setIsDark(true);
      else if (val === 'light') setIsDark(false);
      else setIsDark(systemScheme === 'dark');
      setLoaded(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme_preference', next ? 'dark' : 'light');
  };

  const setDark = async (val) => {
    setIsDark(val);
    await AsyncStorage.setItem('theme_preference', val ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setDark, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { ThemeContext };
