'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogleCredential: (credential: string) => void;
  loginWithGoogleSimulated: (emailInput?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogleCredential: () => {},
  loginWithGoogleSimulated: () => {},
  logout: () => {},
});

const AUTH_STORAGE_KEY = 'memento_user_profile';

// Helper to decode Google JWT token client-side without heavy external dependencies
function decodeGoogleJwt(token: string): { sub: string; name: string; email: string; picture: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT:', e);
    return null;
  }
}

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

  const loginWithGoogleCredential = (credential: string) => {
    const decoded = decodeGoogleJwt(credential);
    if (!decoded) return;

    const profile: UserProfile = {
      id: `google-${decoded.sub}`,
      name: decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      avatarUrl: decoded.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${decoded.sub}`,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const loginWithGoogleSimulated = (emailInput?: string) => {
    const email = emailInput && emailInput.trim() ? emailInput.trim() : 'abdullah.haroon@gmail.com';
    const name = email.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
    const id = `google-usr-${btoa(email).replace(/=/g, '').slice(0, 10)}`;

    const signedInUser: UserProfile = {
      id,
      name,
      email,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80`,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(signedInUser));
    setUser(signedInUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogleCredential,
        loginWithGoogleSimulated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

