// Auth Service - API integration for Authentication

import apiClient from './api/client';

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE';
  phoneNumber: string;
  mainLocationText?: string;
}

export interface SnsSignupRequest {
  provider: string;
  nickname: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  phoneNumber: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    nickname: string;
    email?: string;
  };
}

// Mock responses
const mockAuthResponse = (data: { username?: string; nickname?: string }): AuthResponse => ({
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
  user: {
    id: 1,
    username: data.username || 'user',
    nickname: data.nickname || '지오',
    email: 'user@goldpet.com',
  },
});

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';


export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const response = mockAuthResponse({ username: data.username, nickname: data.nickname });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    }

    try {
      const response = await apiClient.post('/auth/signup', data);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  },

  snsSignup: async (data: SnsSignupRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const response = mockAuthResponse({ nickname: data.nickname });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    }

    try {
      const response = await apiClient.post('/auth/sns-signup', data);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'SNS 회원가입에 실패했습니다.');
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      if (data.username === 'fail') {
        throw new Error('아이디 또는 비밀번호가 잘못되었습니다.');
      }
      const response = mockAuthResponse({ username: data.username });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    }

    try {
      const response = await apiClient.post('/auth/login', data);
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { available: username !== 'duplicate' && username !== 'admin' };
    }

    try {
      const response = await apiClient.get(`/auth/check-username?username=${username}`);
      return response.data;
    } catch {
      return { available: false };
    }
  },

  checkNickname: async (nickname: string): Promise<{ available: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { available: nickname !== 'duplicate' && nickname !== '관리자' };
    }

    try {
      const response = await apiClient.get(`/auth/check-nickname?nickname=${nickname}`);
      return response.data;
    } catch {
      return { available: false };
    }
  },

  openLoginPopup: (provider: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      if (USE_MOCK) {
        // Add a small delay to simulate network
        setTimeout(() => {
          if (window.confirm(`[테스트 모드] ${provider} 계정으로 로그인하시겠습니까?\n(실제 SNS 인증 없이 로그인 처리됩니다)`)) {
            // Call Backend Dev Login to get REAL valid token
            apiClient.post('/auth/dev-login', {})
              .then(response => {
                  const data = response.data;
                  localStorage.setItem('accessToken', data.accessToken);
                  localStorage.setItem('refreshToken', data.refreshToken || '');
                  resolve(data);
              })
              .catch(err => {
                  console.error("Dev login failed", err);
                  alert("테스트 로그인 실패: 백엔드 서버가 실행 중인지 확인해주세요.");
                  reject(err);
              });
          } else {
            console.log('Mock login cancelled');
            // Rejecting here might trigger error handling in LoginPage, just do nothing or reject silent?
            // LoginPage handles error by logging. Let's strictly reject if user cancels?
            // Or just do nothing.
          }
        }, 500); 
        return;
      }

      // Real SNS login popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/${provider}`,
        'Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'LOGIN_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          localStorage.setItem('accessToken', event.data.accessToken);
          localStorage.setItem('refreshToken', event.data.refreshToken);
          resolve(event.data);
          popup?.close();
        } else if (event.data.type === 'LOGIN_ERROR') {
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.message || '로그인에 실패했습니다.'));
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup is closed without completing login
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('로그인이 취소되었습니다.'));
        }
      }, 500);
    });
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return response.data;
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  },
};
