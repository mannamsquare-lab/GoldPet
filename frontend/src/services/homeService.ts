// Home Service - API integration for Home features

import { typedClient } from './api/typedClient';
import type { HomeResponse, UnreadCountResponse } from '../types/api';
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
  myPetNames: string[];
}

const emptyHomeData: HomeDataResponse = {
  recommendations: [],
  recentWalk: null,
  notifications: { hasUnread: false, count: 0 },
  myPetNames: [],
};

export const homeService = {
  getHomeData: async (): Promise<HomeDataResponse> => {
    try {
      const response = await typedClient.get('/api/v1/home');
      const data = response.data as HomeResponse;

      const recommendations: HomeRecommendation[] = (data.recommendations ?? []).map((r) => ({
        id: r.id,
        name: r.petName,
        petAge: r.petAge,
        petBreed: r.petBreed,
        description: r.description || '',
        distance: formatDistanceKm(r.distance),
        images: r.images?.length > 0 ? r.images : ['/assets/images/common/pet_none_img02.svg'],
        isNeutered: r.isNeutered,
        gender: r.petGender as 'MALE' | 'FEMALE',
        nickname: r.nickname,
        profileImageUrl: r.profileImageUrl,
        profileImages: r.profileImages ?? [],
        ownerGender: r.ownerGender,
        ownerAge: r.ownerAge,
        ownerIntro: r.ownerIntro,
        ownerMbti: r.ownerMbti,
        ownerInterests: r.ownerInterests ?? [],
        ownerHobbies: r.ownerHobbies ?? [],
        locationText: truncateLocation(r.locationText),
        tags: r.tags ?? [],
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
        notifications: data.notifications ?? { hasUnread: false, count: 0 },
        myPetNames: data.myPetNames ?? [],
      };
    } catch {
      return emptyHomeData;
    }
  },

  getNotifications: async (): Promise<{ hasUnread: boolean; count: number }> => {
    try {
      const response = await typedClient.get('/api/v1/notifications/unread-count');
      const data = response.data as UnreadCountResponse;
      return { hasUnread: data.count > 0, count: data.count };
    } catch {
      return { hasUnread: false, count: 0 };
    }
  },
};
