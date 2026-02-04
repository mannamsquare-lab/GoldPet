// Profile & Settings Service

import apiClient from './api/client';

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  location: string;
  introduce?: string;
  goldBalance: number;
  walkCount: number;
  totalDistance: number;
  friendCount: number;
  badgeCount: number;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  isNeutered: boolean;
  imageUrl?: string;
  weight?: number;
  description?: string;
}

export interface SettingsData {
  notifications: {
    push: boolean;
    chat: boolean;
    community: boolean;
    marketing: boolean;
  };
  privacy: {
    profilePublic: boolean;
    locationVisible: boolean;
    activityVisible: boolean;
  };
  account: {
    email: string;
    phone?: string;
    linkedAccounts: string[];
  };
}

// Mock data
const mockProfile: UserProfile = {
  id: 1,
  email: 'user@goldpet.com',
  nickname: '지오',
  profileImageUrl: '/assets/images/main/main_slide_butler01.png',
  location: '서울 강남구',
  introduce: '골든 리트리버와 함께 산책하는 것을 좋아해요!',
  goldBalance: 1250,
  walkCount: 42,
  totalDistance: 125.5,
  friendCount: 28,
  badgeCount: 5,
};

const mockPets: Pet[] = [
  {
    id: 1,
    name: 'Goldie',
    species: 'DOG',
    breed: '골든 리트리버',
    birthDate: '2022-03-15',
    gender: 'MALE',
    isNeutered: true,
    imageUrl: '/assets/images/main/main_slide_img01.png',
    weight: 32,
    description: '활발하고 사람을 좋아해요',
  },
];

const mockSettings: SettingsData = {
  notifications: { push: true, chat: true, community: true, marketing: false },
  privacy: { profilePublic: true, locationVisible: true, activityVisible: true },
  account: { email: 'user@goldpet.com', phone: '010-1234-5678', linkedAccounts: ['kakao', 'google'] },
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const profileService = {
  getMyProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) return mockProfile;
    
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch {
      return mockProfile;
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (USE_MOCK) {
      console.log('Updating profile (mock):', data);
      return { ...mockProfile, ...data };
    }
    
    try {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    } catch {
      throw new Error('프로필 수정에 실패했습니다.');
    }
  },

  getMyPets: async (): Promise<Pet[]> => {
    if (USE_MOCK) return mockPets;
    
    try {
      const response = await apiClient.get('/users/me/pets');
      return response.data;
    } catch {
      return mockPets;
    }
  },

  getSettings: async (): Promise<SettingsData> => {
    if (USE_MOCK) return mockSettings;
    
    try {
      const response = await apiClient.get('/users/me/settings');
      return response.data;
    } catch {
      return mockSettings;
    }
  },

  updateSettings: async (data: Partial<SettingsData>): Promise<SettingsData> => {
    if (USE_MOCK) {
      console.log('Updating settings (mock):', data);
      return { ...mockSettings, ...data as SettingsData };
    }
    
    try {
      const response = await apiClient.patch('/users/me/settings', data);
      return response.data;
    } catch {
      throw new Error('설정 변경에 실패했습니다.');
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    if (!USE_MOCK) {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Ignore logout API errors
      }
    }
  },

  deleteAccount: async (): Promise<void> => {
    if (USE_MOCK) {
      console.log('Account deleted (mock)');
      localStorage.clear();
      return;
    }
    
    try {
      await apiClient.delete('/users/me');
      localStorage.clear();
    } catch {
      throw new Error('회원 탈퇴에 실패했습니다.');
    }
  },
};
