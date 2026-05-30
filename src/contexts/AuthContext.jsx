import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../lib/api';

const STORAGE_KEY = 'ministar_user';

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch (_) {}
      }
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email.toLowerCase().trim(), password);
      const u = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name,
        role: data.user.role,
        avatar: data.user.avatar_url || null,
      };
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true, role: u.role };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const signup = async (email, password, fullName, role) => {
    try {
      const data = await api.signup(email.toLowerCase().trim(), password, fullName, role);
      const u = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name,
        role: data.user.role,
        avatar: data.user.avatar_url || null,
      };
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true, role: u.role };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await api.logout();
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
