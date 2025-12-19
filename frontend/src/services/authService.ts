// import { apiClient } from './api/client'; // Unused in mock mode


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
        // Mock Implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                    user: {
                        id: 1,
                        username: data.username,
                        nickname: data.nickname,
                        email: data.email
                    }
                });
            }, 800);
        });
    },

    snsSignup: async (data: SnsSignupRequest): Promise<AuthResponse> => {
         // Mock Implementation
         return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    accessToken: 'mock-sns-access-token',
                    refreshToken: 'mock-sns-refresh-token',
                    user: {
                        id: 2,
                        username: 'sns_user',
                        nickname: data.nickname,
                    }
                });
            }, 800);
        });
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
         // Mock Implementation
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (data.username === 'fail') {
                    reject({ response: { data: { message: '아이디 또는 비밀번호가 잘못되었습니다.' } } });
                } else {
                    resolve({
                        accessToken: 'mock-login-token',
                        refreshToken: 'mock-login-refresh-token',
                        user: {
                            id: 1,
                            username: data.username,
                            nickname: '지오', // Mock nickname
                            email: 'user@example.com'
                        }
                    });
                }
            }, 600);
        });
    },

    checkUsername: async (username: string): Promise<{ available: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ available: username !== 'duplicate' });
            }, 300);
        });
    },

    checkNickname: async (nickname: string): Promise<{ available: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ available: nickname !== 'duplicate' });
            }, 300);
        });
    },

    openLoginPopup: (_provider: string): Promise<any> => {
        // Mock Implementation
        return new Promise((resolve) => {
             setTimeout(() => {
                 resolve({
                     type: 'LOGIN_SUCCESS',
                     token: 'mock-sns-token',
                     user: {
                         id: 10,
                         nickname: 'SNS User'
                     }
                 });
             }, 1000);
        });
    },
};
