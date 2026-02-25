/**
 * 인증 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nativeBridge } from '../bridge/nativeBridge';
import { queryClient } from '../lib/queryClient';
import { chatWebSocket } from '../services/websocket/chatWebSocket';

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
  oauthProvider?: string;
  isProfileLocked?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) => {
        // 방어적: 이전 유저 캐시 제거
        queryClient.cancelQueries();
        queryClient.clear();
        set({ token, refreshToken, user, isAuthenticated: true });
        if (nativeBridge.isAvailable()) {
          // Sync auth tokens to Flutter secure storage for native API calls
          nativeBridge.callMethod('syncAuthToken', { accessToken: token, refreshToken }).catch(() => {});
          // Register FCM token with backend
          nativeBridge.callMethod('registerFcmToken', { accessToken: token }).catch(() => {});
        }
      },
      logout: () => {
        // 1. WebSocket 해제 (토큰 참조하므로 먼저)
        chatWebSocket.disconnect();
        // 2-3. React Query 캐시 정리
        queryClient.cancelQueries();
        queryClient.clear();
        // 4. user-specific localStorage 삭제
        localStorage.removeItem('friendFindFilter');
        localStorage.removeItem('autoLogin');
        // 5. Flutter 토큰 삭제
        if (nativeBridge.isAvailable()) {
          nativeBridge.callMethod('clearAuthToken').catch(() => {});
        }
        // 6. Zustand 상태 초기화
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      updateUser: (user) => {
        set({ user });
      },
      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
        if (nativeBridge.isAvailable()) {
          nativeBridge.callMethod('syncAuthToken', { accessToken: token, refreshToken }).catch(() => {});
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

