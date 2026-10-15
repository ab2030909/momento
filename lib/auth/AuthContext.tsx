'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: () => {},
  logout: () => {},
});

const AUTH_STORAGE_KEY = 'memento_user_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load user session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = () => {
    // Generates or simulates a Google Single-Sign-On Account profile with unique Google ID
    const sampleAccounts: UserProfile[] = [
      {
        id: 'google-usr-948123',
        name: 'Abdullah Haroon',
        email: 'abdullah.haroon@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      },
      {
        id: 'google-usr-512094',
        name: 'Research Operator',
        email: 'operator@cloud.dev',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
      },
    ];

    // Select account or prompt for a Google email
    const emailPrompt = prompt('Sign in with Google Account:\nEnter Google Email (or leave empty for default):', 'user@gmail.com');
    const email = emailPrompt && emailPrompt.trim() ? emailPrompt.trim() : 'user@gmail.com';
    const name = email.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
    const id = `google-usr-${btoa(email).replace(/=/g, '').slice(0, 10)}`;

    const signedInUser: UserProfile = {
      id,
      name,
      email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(signedInUser));
    setUser(signedInUser);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
