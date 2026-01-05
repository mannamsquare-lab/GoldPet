/**
 * 인증 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
  profileImageUrls?: string[];
  gender?: string;
  birthYear?: number;
  mainLocationText?: string;
  goldBalance?: number;
  phoneNumber?: string;
  name?: string;
  birthDate?: string;
  mbti?: string;
  interests?: string[];
  hobbies?: string[];
  intro?: string;
  hasPet?: boolean;
  isNotificationEnabled?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) => {
        set({ token, refreshToken, user, isAuthenticated: true });
        localStorage.setItem('accessToken', token);
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
      },
      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

