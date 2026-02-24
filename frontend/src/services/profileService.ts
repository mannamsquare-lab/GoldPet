// Profile & Settings Service

import apiClient from './api/client';
import { useAuthStore } from '../stores/authStore';

export const profileService = {
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    }
    useAuthStore.getState().logout();
  },

  deleteAccount: async (): Promise<void> => {
    try {
      await apiClient.delete('/users/me');
      useAuthStore.getState().logout();
    } catch {
      throw new Error('회원 탈퇴에 실패했습니다.');
    }
  },
};
