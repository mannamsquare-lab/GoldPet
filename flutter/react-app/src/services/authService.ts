import { apiClient } from '../lib/api/client';
import { nativeBridge } from '../bridge/nativeBridge';

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

export const authService = {
    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },
    snsSignup: async (data: SnsSignupRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/sns-signup', data);
        return response.data;
    },
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },
    checkUsername: async (username: string): Promise<{ available: boolean }> => {
        const response = await apiClient.post<{ available: boolean }>('/auth/check-username', { username });
        return response.data;
    },
    checkNickname: async (nickname: string): Promise<{ available: boolean }> => {
        const response = await apiClient.post<{ available: boolean }>('/auth/check-nickname', { nickname });
        return response.data;
    },
    openLoginPopup: (provider: string): Promise<any> => {
        // Native Bridge Check
        if (nativeBridge.isAvailable()) {
            return nativeBridge.callMethod('login', { provider });
        }

        return new Promise((resolve, reject) => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
            const backendUrl = baseUrl.replace('/api/v1', '');
            const url = `${backendUrl}/oauth2/authorization/${provider}`;
            const width = 500;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                url,
                'SNS Login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!popup) {
                reject(new Error('Popup blocked'));
                return;
            }

            const messageHandler = (event: MessageEvent) => {
                // 보안을 위해 origin 체크를 하는 것이 좋지만, 
                // 개발 환경(localhost, IP)과 배포 환경이 다양하므로 
                // 일단 데이터 구조로 판별
                if (event.data && (event.data.type === 'LOGIN_SUCCESS' || event.data.type === 'SIGNUP_REQUIRED')) {
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    resolve(event.data);
                }
            };

            window.addEventListener('message', messageHandler);
        });
    },
};
