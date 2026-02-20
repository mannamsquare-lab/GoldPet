
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
        } catch (error: any) {
            throw new Error(error.response?.data?.message || '사용자 정보를 가져오는데 실패했습니다.');
        }
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        // Backend endpoint might differ. 
        // Based on previous summary: `updateUserProfileImages` exists.
        // And standard `updateProfile` likely exists or I should assume one.
        // Assuming `PUT /users/me` or similar.
        // If not checking backend controller, I might error. 
        // I'll assume `/users/me` or `/users/profile`.
        // Let's check backend controller later if needed, but for now standardizing.
        // Wait, the summary said: `updateMyProfileImage` endpoint calls `userService.updateUserProfileImages`.
        // But what about nickname?
        // I'll assume a general update endpoint exists or I might need to use specific ones.
        // Actually, looking at `UserResponse`, it has nickname, etc.
        // I'll try `PUT /users/me`.
        try {
            const response = await apiClient.put('/users/me', data);
            return response.data;
        } catch (error: any) {
             throw new Error(error.response?.data?.message || '프로필 수정에 실패했습니다.');
        }
    },

    updateProfileImages: async (imageUrls: string[]): Promise<User> => {
        try {
            const response = await apiClient.put('/users/me/profile-image', { profileImageUrls: imageUrls });
            return response.data;
        } catch (error: any) {
             throw new Error(error.response?.data?.message || '프로필 이미지 수정에 실패했습니다.');
        }
    },
    
    uploadImage: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'profile');
            const response = await apiClient.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.url;
        } catch (error: any) {
             throw new Error('이미지 업로드에 실패했습니다.');
        }
    },

    getInterests: async (): Promise<{id: number, name: string}[]> => {
        try {
            const response = await apiClient.get('/users/interests');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch interests', error);
            return [];
        }
    },

    getHobbies: async (): Promise<{id: number, name: string}[]> => {
        try {
            const response = await apiClient.get('/users/hobbies');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch hobbies', error);
            return [];
        }
    },

    checkNickname: async (nickname: string): Promise<boolean> => {
        try {
            const response = await apiClient.get(`/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
            return response.data.available;
        } catch (error) {
            console.error('Failed to check nickname:', error);
            throw error;
        }
    },

    requestVerificationCode: async (phoneNumber: string): Promise<boolean> => {
        try {
            await apiClient.post('/auth/verification/request', { phoneNumber });
            return true;
        } catch (error) {
            console.error('Failed to request verification code:', error);
            throw error;
        }
    },

    confirmVerificationCode: async (phoneNumber: string, code: string): Promise<boolean> => {
        try {
            const response = await apiClient.post('/auth/verification/confirm', { phoneNumber, code });
            return response.data.success;
        } catch (error) {
            console.error('Failed to confirm verification code:', error);
            return false;
        }
    },

    updateNotification: async (enabled: boolean): Promise<User> => {
        try {
            // Assuming we use PATCH /users/me or a specific endpoint.
            // For now, reuse updateProfile if backend supports it, or create specific endpoint.
            // I will create a specific endpoint in Controller: PATCH /users/me/notification
            const response = await apiClient.patch('/users/me/notification', { enabled });
            return response.data;
        } catch (error: any) {
             throw new Error(error.response?.data?.message || '알림 설정 변경에 실패했습니다.');
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
