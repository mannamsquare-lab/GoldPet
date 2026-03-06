
import apiClient from './api/client';
import { type User } from '../stores/authStore';

export interface UpdateProfileRequest {
    nickname?: string;
    // email is usually read-only or handled separately
    imageUrls?: string[];
    name?: string;
    birthDate?: string;
    phoneNumber?: string;
    gender?: string;
    hasPet?: boolean;
    intro?: string;
    mbti?: string;
    interests?: string[];
    hobbies?: string[];
}

export interface UserStats {
  matchingCount: number;
  likesCount: number;
  friendsCount: number;
}

export const userService = {
    getMe: async (): Promise<User> => {
        try {
            const response = await apiClient.get('/users/me');
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err.response?.data?.message || '사용자 정보를 가져오는데 실패했습니다.');
        }
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        try {
            const response = await apiClient.put('/users/me', data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
             throw new Error(err.response?.data?.message || '프로필 수정에 실패했습니다.');
        }
    },

    updateProfileImages: async (imageUrls: string[]): Promise<User> => {
        try {
            const response = await apiClient.put('/users/me/profile-image', { profileImageUrls: imageUrls });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
             throw new Error(err.response?.data?.message || '프로필 이미지 수정에 실패했습니다.');
        }
    },

    uploadImage: async (file: File): Promise<string> => {
        try {
            const { compressImage } = await import('../utils/imageCompression');
            const compressed = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressed);
            formData.append('category', 'profile');
            const response = await apiClient.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.url;
        } catch {
             throw new Error('이미지 업로드에 실패했습니다.');
        }
    },

    getInterests: async (): Promise<{id: number, name: string}[]> => {
        try {
            const response = await apiClient.get('/users/interests');
            return response.data;
        } catch (error: unknown) {
            console.error('Failed to fetch interests', error);
            throw error;
        }
    },

    getHobbies: async (): Promise<{id: number, name: string}[]> => {
        try {
            const response = await apiClient.get('/users/hobbies');
            return response.data;
        } catch (error: unknown) {
            console.error('Failed to fetch hobbies', error);
            throw error;
        }
    },

    checkNickname: async (nickname: string): Promise<boolean> => {
        try {
            const response = await apiClient.get(`/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
            return response.data.available;
        } catch (error: unknown) {
            console.error('Failed to check nickname:', error);
            throw error;
        }
    },

    requestVerificationCode: async (phoneNumber: string): Promise<string | null> => {
        try {
            const response = await apiClient.post('/auth/verification/request', { phoneNumber });
            return response.data.code || null;
        } catch (error: unknown) {
            console.error('Failed to request verification code:', error);
            throw error;
        }
    },

    confirmVerificationCode: async (phoneNumber: string, code: string): Promise<boolean> => {
        try {
            const response = await apiClient.post('/auth/verification/confirm', { phoneNumber, code });
            return response.data.success;
        } catch (error: unknown) {
            console.error('Failed to confirm verification code:', error);
            return false;
        }
    },

    updateNotification: async (enabled: boolean): Promise<User> => {
        try {
            const response = await apiClient.patch('/users/me/notification', { enabled });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
             throw new Error(err.response?.data?.message || '알림 설정 변경에 실패했습니다.');
        }
    },

    getMyStats: async (): Promise<UserStats> => {
        const response = await apiClient.get('/users/me/stats');
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        await apiClient.put('/users/me/password', { currentPassword, newPassword });
    },
};
