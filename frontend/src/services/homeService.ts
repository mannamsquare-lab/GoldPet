// Home Service - API integration for Home features

import apiClient from './api/client';
import { truncateLocation, formatDistanceKm } from '../utils/formatters';

export interface HomeRecommendation {
  id: number;
  name: string;
  petAge: number;
  petBreed: string;
  description: string;
  distance: string;
  images: string[];
  isNeutered: boolean;
  gender: 'MALE' | 'FEMALE';
  nickname: string;
  profileImageUrl?: string;
  profileImages: string[];  // Owner's all profile images
  ownerGender?: string;
  ownerAge?: number;
  ownerIntro?: string;
  ownerMbti?: string;
  ownerInterests: string[];
  ownerHobbies: string[];
  locationText?: string;
  tags: string[];
}

export interface HomeRecentWalk {
  id: number;
  distanceKm: number;
  durationSeconds: number;
  endTime: string;
  startAddress: string | null;
  petNames: string[];
  petProfileImageUrls: string[];
}

export interface HomeDataResponse {
  recommendations: HomeRecommendation[];
  recentWalk: HomeRecentWalk | null;
  notifications: {
    hasUnread: boolean;
    count: number;
  };
}

// Mock data for fallback
const mockHomeData: HomeDataResponse = {
  recommendations: [
    {
      id: 1,
      name: '멍텅구리',
      petAge: 0,
      petBreed: '코숏 치즈',
      description: '',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png'],
      isNeutered: true,
      gender: 'FEMALE',
      nickname: '지오',
      profileImageUrl: '/assets/images/main/main_slide_butler01.jpg',
      profileImages: ['/assets/images/main/main_slide_butler01.jpg'],
      ownerGender: 'FEMALE',
      ownerAge: 28,
      ownerIntro: '',
      ownerMbti: undefined,
      ownerInterests: [],
      ownerHobbies: [],
      locationText: undefined,
      tags: [],
    },
    {
      id: 2,
      name: '냥냥냥',
      petAge: 0,
      petBreed: '코숏 치즈',
      description: '',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img02.png', '/assets/images/main/main_slide_img02.png'],
      isNeutered: true,
      gender: 'FEMALE',
      nickname: '냥집사',
      profileImageUrl: '/assets/images/main/main_slide_butler02.jpg',
      profileImages: ['/assets/images/main/main_slide_butler02.jpg'],
      ownerGender: 'FEMALE',
      ownerAge: 28,
      ownerIntro: '',
      ownerMbti: undefined,
      ownerInterests: [],
      ownerHobbies: [],
      locationText: undefined,
      tags: [],
    },
    {
      id: 3,
      name: '멍멍이',
      petAge: 0,
      petBreed: '코숏 치즈',
      description: '',
      distance: '1km 이내',
      images: ['/assets/images/main/main_slide_img03.png', '/assets/images/main/main_slide_img03.png'],
      isNeutered: true,
      gender: 'MALE',
      nickname: '멍집사',
      profileImageUrl: '/assets/images/main/main_slide_butler03.jpg',
      profileImages: ['/assets/images/main/main_slide_butler03.jpg'],
      ownerGender: 'MALE',
      ownerAge: 28,
      ownerIntro: '',
      ownerMbti: undefined,
      ownerInterests: [],
      ownerHobbies: [],
      locationText: undefined,
      tags: [],
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
        petAge: r.petAge,
        petBreed: r.petBreed,
        description: r.description || '',
        distance: formatDistanceKm(r.distance),
        images: r.images.length > 0 ? r.images : ['/assets/images/common/pet_none_img02.svg'],
        isNeutered: r.isNeutered,
        gender: r.petGender,
        nickname: r.nickname,
        profileImageUrl: r.profileImageUrl,
        profileImages: r.profileImages || [],
        ownerGender: r.ownerGender,
        ownerAge: r.ownerAge,
        ownerIntro: r.ownerIntro,
        ownerMbti: r.ownerMbti,
        ownerInterests: r.ownerInterests || [],
        ownerHobbies: r.ownerHobbies || [],
        locationText: truncateLocation(r.locationText),
        tags: r.tags || [],
      }));

      return {
        recommendations,
        recentWalk: data.recentWalk ? {
          id: data.recentWalk.id,
          distanceKm: data.recentWalk.distanceKm,
          durationSeconds: data.recentWalk.durationSeconds,
          endTime: data.recentWalk.endTime,
          startAddress: data.recentWalk.startAddress ?? null,
          petNames: data.recentWalk.petNames ?? [],
          petProfileImageUrls: data.recentWalk.petProfileImageUrls ?? [],
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
