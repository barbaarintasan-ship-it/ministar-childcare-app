import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Demo accounts — work without Supabase
const DEMO_USERS = {
  'parent@demo.com': {
    id: 'demo-parent-1',
    name: 'Sarah Johnson',
    role: 'parent',
    email: 'parent@demo.com',
    avatar: null,
    childId: 'child-1',
  },
  'teacher@demo.com': {
    id: 'demo-teacher-1',
    name: 'Ms. Patricia Torres',
    role: 'teacher',
    email: 'teacher@demo.com',
    avatar: null,
    room: 'Sunflower',
  },
  'admin@demo.com': {
    id: 'demo-admin-1',
    name: 'Linda Park',
    role: 'admin',
    email: 'admin@demo.com',
    avatar: null,
  },
};

const DEMO_PASSWORD = 'demo123';
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
    // Try to restore session
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch (_) {}
      }
      setLoading(false);
    });

    // Also listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          const u = {
            id: session.user.id,
            email: session.user.email,
            name: profile.full_name,
            role: profile.role,
            avatar: profile.avatar_url,
            childId: profile.child_id,
            room: profile.room,
          };
          setUser(u);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        }
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const lowerEmail = email.toLowerCase().trim();

    // Check demo accounts first
    const demo = DEMO_USERS[lowerEmail];
    if (demo && password === DEMO_PASSWORD) {
      setUser(demo);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return { success: true, role: demo.role };
    }

    // Try Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: lowerEmail, password });
      if (error) return { success: false, error: 'Invalid email or password. Try demo accounts.' };
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile) {
          const u = {
            id: data.user.id,
            email: data.user.email,
            name: profile.full_name,
            role: profile.role,
            avatar: profile.avatar_url,
            childId: profile.child_id,
          };
          setUser(u);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          return { success: true, role: profile.role };
        }
      }
    } catch (_) {
      // Supabase not configured — fall through
    }

    return { success: false, error: 'Invalid email or password. Try demo accounts below.' };
  };

  const signup = async (email, password, fullName, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
        });
        const u = { id: data.user.id, email, name: fullName, role };
        setUser(u);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return { success: true, role };
      }
    } catch (_) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
    return { success: false, error: 'Registration failed.' };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    try { await supabase.auth.signOut(); } catch (_) {}
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
