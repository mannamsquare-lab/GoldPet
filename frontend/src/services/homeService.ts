// Home Service - API integration for Home features

import apiClient from './api/client';

export interface HomeDataResponse {
  user: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
    point: number;
  };
  pet?: {
    id: number;
    name: string;
    imageUrl?: string;
    breed: string;
    age: number;
  };
  notifications: {
    hasUnread: boolean;
    count: number;
  };
  weather?: {
    temp: number;
    condition: string; // 'sunny' | 'cloudy' | 'rain' | 'snow'
    text: string;
  };
  recommendations: {
    id: number;
    name: string;
    description: string;
    distance: string;
    images: string[];
    isNeutered: boolean;
    gender: 'MALE' | 'FEMALE';
  }[];
}

// Mock data
const mockHomeData: HomeDataResponse = {
  user: {
    id: 1,
    nickname: '지오',
    point: 1250,
    profileImageUrl: '/assets/images/main/main_slide_butler01.png',
  },
  pet: {
    id: 101,
    name: 'Goldie',
    breed: 'Golden Retriever',
    age: 3,
    imageUrl: '/assets/images/main/main_slide_img01.png',
  },
  notifications: {
    hasUnread: true,
    count: 3,
  },
  weather: {
    temp: 24,
    condition: 'sunny',
    text: '산책하기 딱 좋은 날씨에요!',
  },
  recommendations: [
    {
      id: 1,
      name: '멍텅구리',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png'],
      isNeutered: true,
      gender: 'FEMALE',
    },
    {
      id: 2,
      name: '냥냥냥',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img02.png', '/assets/images/main/main_slide_img02.png'],
      isNeutered: true,
      gender: 'FEMALE',
    },
    {
      id: 3,
      name: '멍멍이',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img03.png', '/assets/images/main/main_slide_img03.png'],
      isNeutered: true,
      gender: 'MALE',
    },
  ],
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const homeService = {
  getHomeData: async (): Promise<HomeDataResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockHomeData;
    }

    try {
      const response = await apiClient.get('/home');
      return response.data;
    } catch {
      return mockHomeData;
    }
  },

  getRecommendations: async (page = 0, size = 10): Promise<HomeDataResponse['recommendations']> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return mockHomeData.recommendations;
    }

    try {
      const response = await apiClient.get(`/friends/recommendations?page=${page}&size=${size}`);
      return response.data.content || response.data;
    } catch {
      return mockHomeData.recommendations;
    }
  },

  getNotifications: async (): Promise<{ hasUnread: boolean; count: number }> => {
    if (USE_MOCK) {
      return { hasUnread: true, count: 3 };
    }

    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch {
      return { hasUnread: false, count: 0 };
    }
  },

  getWeather: async (lat: number, lng: number): Promise<HomeDataResponse['weather']> => {
    if (USE_MOCK) {
      return { temp: 24, condition: 'sunny', text: '산책하기 딱 좋은 날씨에요!' };
    }

    try {
      const response = await apiClient.get(`/weather?lat=${lat}&lng=${lng}`);
      return response.data;
    } catch {
      return undefined;
    }
  },
};
