// Home Service - API integration for Home features

import apiClient from './api/client';

export interface HomeRecommendation {
  id: number;
  name: string;
  description: string;
  distance: string;
  images: string[];
  isNeutered: boolean;
  gender: 'MALE' | 'FEMALE';
  nickname: string;
  profileImageUrl?: string;
  locationText?: string;
}

export interface HomeRecentWalk {
  id: number;
  petName: string;
  placeName: string;
  distanceKm: number;
  durationSeconds: number;
  endTime: string;
}

export interface HomeDataResponse {
  recommendations: HomeRecommendation[];
  recentWalk: HomeRecentWalk | null;
  notifications: {
    hasUnread: boolean;
    count: number;
  };
}

// Format distance from meters to Korean string
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m 이내`;
  return `${(meters / 1000).toFixed(1)}km 이내`;
}

// Mock data for fallback
const mockHomeData: HomeDataResponse = {
  recommendations: [
    {
      id: 1,
      name: '멍텅구리',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png'],
      isNeutered: true,
      gender: 'FEMALE',
      nickname: '지오',
      profileImageUrl: '/assets/images/main/main_slide_butler01.jpg',
      locationText: undefined,
    },
    {
      id: 2,
      name: '냥냥냥',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img02.png', '/assets/images/main/main_slide_img02.png'],
      isNeutered: true,
      gender: 'FEMALE',
      nickname: '냥집사',
      profileImageUrl: '/assets/images/main/main_slide_butler02.jpg',
      locationText: undefined,
    },
    {
      id: 3,
      name: '멍멍이',
      description: '5개월 ∙ 코숏 치즈',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img03.png', '/assets/images/main/main_slide_img03.png'],
      isNeutered: true,
      gender: 'MALE',
      nickname: '멍집사',
      profileImageUrl: '/assets/images/main/main_slide_butler03.jpg',
      locationText: undefined,
    },
  ],
  recentWalk: null,
  notifications: {
    hasUnread: false,
    count: 0,
  },
};

export const homeService = {
  getHomeData: async (): Promise<HomeDataResponse> => {
    try {
      const response = await apiClient.get('/home');
      const data = response.data;

      // Map backend FriendResponse to frontend HomeRecommendation
      const recommendations: HomeRecommendation[] = (data.recommendations || []).map((r: any) => ({
        id: r.id,
        name: r.petName,
        description: `${r.petAge}개월 ∙ ${r.petBreed}`,
        distance: formatDistance(r.distance),
        images: r.images.length > 0 ? r.images : ['/assets/images/common/pet_none_img02.svg'],
        isNeutered: r.isNeutered,
        gender: r.petGender,
        nickname: r.nickname,
        profileImageUrl: r.profileImageUrl,
        locationText: r.locationText,
      }));

      return {
        recommendations,
        recentWalk: data.recentWalk ? {
          id: data.recentWalk.id,
          petName: '', // Will need to be populated from context
          placeName: '', // Will need geocoding
          distanceKm: data.recentWalk.distanceKm,
          durationSeconds: data.recentWalk.durationSeconds,
          endTime: data.recentWalk.endTime,
        } : null,
        notifications: data.notifications || { hasUnread: false, count: 0 },
      };
    } catch {
      return mockHomeData;
    }
  },

  getNotifications: async (): Promise<{ hasUnread: boolean; count: number }> => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return { hasUnread: response.data.count > 0, count: response.data.count };
    } catch {
      return { hasUnread: false, count: 0 };
    }
  },
};
