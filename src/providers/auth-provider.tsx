'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useMe } from '@/hooks';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
  setAuth: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/reset-password', '/forgot-password', '/create-password', '/devis', '/facture', '/paiement', '/onboarding'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useMe(mounted && !isPublicRoute);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const setAuth = (accessToken: string, refreshToken: string) => {
    // Les tokens sont déjà stockés dans les cookies par l'API
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        logout,
        isLoading,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
