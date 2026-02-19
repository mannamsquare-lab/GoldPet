/**
 * 인증 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nativeBridge } from '../bridge/nativeBridge';

export interface User {
  id: number;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
  profileImageUrls?: string[];
  gender?: string;
  birthYear?: number;
  mainLocationText?: string;
  mainLocationLat?: number;
  mainLocationLng?: number;
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
  isActive?: boolean;
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
        if (nativeBridge.isAvailable()) {
          // Sync auth tokens to Flutter secure storage for native API calls
          nativeBridge.callMethod('syncAuthToken', { accessToken: token, refreshToken }).catch(() => {});
          // Register FCM token with backend
          nativeBridge.callMethod('registerFcmToken', { accessToken: token }).catch(() => {});
        }
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist safe, non-sensitive data. Tokens and PII remain in-memory only.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user ? {
          id: state.user.id,
          nickname: state.user.nickname,
          profileImageUrl: state.user.profileImageUrl,
          profileImageUrls: state.user.profileImageUrls,
          hasPet: state.user.hasPet,
          isNotificationEnabled: state.user.isNotificationEnabled,
          isActive: state.user.isActive,
        } : null,
      }),
    }
  )
);

