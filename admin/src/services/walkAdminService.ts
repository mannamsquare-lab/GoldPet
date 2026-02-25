import { apiClient } from './apiClient';
import type { PageResponse } from '../types/api';

export interface WalkAdminResponse {
  id: number;
  userId: number;
  userNickname: string | null;
  startTime: string;
  endTime: string | null;
  distanceKm: number;
  durationSeconds: number;
  caloriesBurned: number;
  spotsCount: number;
  createdAt: string;
}

export interface WalkSpotDto {
  id: number;
  type: 'PEE' | 'POOP' | 'PHOTO' | 'PROBLEM' | 'OTHER';
  latitude: number;
  longitude: number;
  timestamp: string;
  imageUrl: string | null;
  note: string | null;
}

export interface WalkDetailResponse {
  id: number;
  userId: number;
  userNickname: string | null;
  startTime: string;
  endTime: string | null;
  distanceKm: number;
  durationSeconds: number;
  caloriesBurned: number;
  notes: string | null;
  pathCoordinates: { latitude: number; longitude: number }[];
  spots: WalkSpotDto[];
  userPets: { petId: number; petName: string; breed: string; species: string }[];
  createdAt: string;
}

export interface WalkStatsDetailResponse {
  totalWalks: number;
  totalDistanceKm: number;
  averageDistanceKm: number;
  averageDurationMinutes: number;
  dailyBreakdown: { date: string; count: number; totalDistanceKm: number }[];
}

export interface GetWalksParams {
  page?: number;
  size?: number;
  userNickname?: string;
  startDate?: string;
  endDate?: string;
  minDistance?: number;
  maxDistance?: number;
}

export interface GetDetailedStatsParams {
  startDate?: string;
  endDate?: string;
}

export const walkAdminService = {
  async getWalks(params: GetWalksParams = {}): Promise<PageResponse<WalkAdminResponse>> {
    const response = await apiClient.get('/walks', { params });
    return response.data;
  },

  async getWalkDetail(id: number): Promise<WalkDetailResponse> {
    const response = await apiClient.get(`/walks/${id}`);
    return response.data;
  },

  async deleteWalk(id: number, reason: string): Promise<void> {
    await apiClient.delete(`/walks/${id}`, { data: { reason } });
  },

  async getDetailedStats(params: GetDetailedStatsParams = {}): Promise<WalkStatsDetailResponse> {
    const response = await apiClient.get('/walks/stats/detailed', { params });
    return response.data;
  },
};
