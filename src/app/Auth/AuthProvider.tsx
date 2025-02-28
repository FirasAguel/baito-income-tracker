'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UserType = 'admin' | 'employee';

export type Profile = {
  userId: string;
  username: string;
  pictureUrl?: string;
  //userType: UserType;
  token?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  profile: Profile | null;
  login: (profile: Profile) => void;
  logout: () => void;
  //userType: UserType | null;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  
];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  //const [userType, setUserType] = useState<UserType | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // 初期化時に localStorage から認証情報を読み込む
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedProfile = localStorage.getItem('profile');
    console.log('token:', token);
    if (token && storedProfile) {
      const parsedProfile: Profile = JSON.parse(storedProfile);
      parsedProfile.token = token;
      setIsAuthenticated(true);
      setProfile(parsedProfile);
      //setUserType(parsedProfile.userType);
    } else {
      setIsAuthenticated(false);
    }
    setInitialized(true);
  }, []);

  // ルート遷移時のリダイレクト処理
  useEffect(() => {
    if (!initialized) return;
    //
    const isPublic = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    );
    if (!isAuthenticated && !isPublic) {
      router.push('/');
    }
    if (isAuthenticated && isPublic) {
      router.push('/homepage');
    }
  }, [initialized, isAuthenticated, pathname, router]);

  const handleLogoutDueToInactivity = () => {
    console.log('一定時間操作がなかったため、自動的にログアウトします');
    logout();
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (isAuthenticated) {
      inactivityTimer.current = setTimeout(handleLogoutDueToInactivity, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivityTimer();
    };
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    resetInactivityTimer();
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [isAuthenticated]);

  // ログイン関数（Supabase Auth を利用した認証後、アクセストークンを profile.token として受け取る前提）
  const login = (profile: Profile) => {
    setIsAuthenticated(true);
    setProfile(profile);
    //setUserType(profile.userType);
    localStorage.setItem('profile', JSON.stringify(profile));
    localStorage.setItem('token', profile.token || '');
    // Cookie にも保存（サーバー側ミドルウェアで利用）
    document.cookie = `token=${profile.token}; path=/;`;
  };

  // ログアウト関数
  const logout = async () => {
    setIsAuthenticated(false);
    setProfile(null);
    //setUserType(null);
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, profile, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth は AuthProvider 内で使用してください');
  }
  return context;
}
