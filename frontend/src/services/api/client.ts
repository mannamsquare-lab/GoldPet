/**
 * API 클라이언트 설정
 */

import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// 요청 인터셉터: 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 처리
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 'DORMANT_ACCOUNT') {
        useAuthStore.getState().logout();
        window.location.href = '/account/dormant';
      } else if (errorCode === 'WITHDRAWN_ACCOUNT') {
        useAuthStore.getState().logout();
        window.location.href = '/account/withdrawn';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

