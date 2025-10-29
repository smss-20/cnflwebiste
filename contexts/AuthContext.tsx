import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../supabase/api';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, fbLink: string, password: string) => Promise<{ error: { message: string } | null }>;
  updatePassword: (password: string) => Promise<{ error: { message: string } | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (supabaseUser: SupabaseUser) => {
      try {
        const { data: profile, error } = await api.getProfile(supabaseUser);
        if (error) throw error;
        setUser(profile as User);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial session check
    api.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = api.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await api.signIn(email, password);
    return { error: error ? { message: error.message } : null };
  };

  const logout = async () => {
    await api.signOut();
    setUser(null);
  };

  const register = async (fullName: string, email: string, fbLink: string, password: string) => {
    try {
      await api.signUp(fullName, email, fbLink, password);
      // The onAuthStateChange listener will handle setting the user state after signup
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const updatePassword = async (password: string) => {
     if (!password) return { error: { message: "Password cannot be empty." } };
     const { error } = await api.updateUserPassword(password);
     return { error: error ? { message: error.message } : null };
  };

  const value = { user, loading, login, logout, register, updatePassword };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};