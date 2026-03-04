// Walk Service - API integration for Walk features

import apiClient from './api/client';

export interface WalkRecord {
  id: number;
  date: string;
  distance: string;
  duration: string;
  points: string;
  // raw values for computation/display
  distanceKm?: number;
  durationSeconds?: number;
  caloriesBurned?: number;
  startTime?: string;
  path?: { lat: number; lng: number }[];
  startAddress?: string;
}

export interface WalkStats {
  todayDistance: string;
  todayCalories: string;
  weeklyDistance?: number;
  monthlyDistance?: number;
  totalWalks?: number;
}

export interface WalkSession {
  id: number;
  startTime: string;
  endTime?: string;
  distance: number;
  calories: number;
  pathPoints?: { lat: number; lng: number }[];
  startAddress?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  petNames?: string[];
  petIds?: number[];
}

export interface WalkRankingEntry {
  rank: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  totalDistanceKm: number;
  walkCount: number;
}

// Backend WalkResponse -> Frontend WalkRecord 변환
function toWalkRecord(walk: {
  id: number;
  startTime: string;
  endTime: string;
  distanceKm: number;
  durationSeconds: number;
  caloriesBurned?: number;
  path?: number[][];
  startAddress?: string;
}): WalkRecord {
  const date = new Date(walk.startTime);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  const minutes = Math.round(walk.durationSeconds / 60);
  const gold = Math.round(walk.distanceKm * 10); // 1km = 10G 기준
  return {
    id: walk.id,
    date: dateStr,
    distance: `${walk.distanceKm.toFixed(1)} Km`,
    duration: `총 ${minutes}분`,
    points: `${gold}G 적립`,
    distanceKm: walk.distanceKm,
    durationSeconds: walk.durationSeconds,
    caloriesBurned: walk.caloriesBurned,
    startTime: walk.startTime,
    path: walk.path ? pathToCoords(walk.path) : undefined,
    startAddress: walk.startAddress ?? undefined,
  };
}

// Transform backend [[lat,lng],...] array to {lat, lng}[] objects
export function pathToCoords(path: number[][]): { lat: number; lng: number }[] {
  return path.map(([lat, lng]) => ({ lat, lng }));
}

// Filter walk records by today and compute totals
export function getTodayStats(records: WalkRecord[]): { distance: number; calories: number } {
  const today = new Date();
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const todayRecords = records.filter(r => r.date === todayStr);
  return {
    distance: todayRecords.reduce((sum, r) => sum + (r.distanceKm ?? 0), 0),
    calories: todayRecords.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0),
  };
}

export const walkService = {
  getWalkStats: async (): Promise<WalkStats> => {
    try {
      const response = await apiClient.get('/walks/my/stats');
      const data = response.data;
      return {
        todayDistance: data.totalDistanceKm?.toFixed(1) || '0.0',
        todayCalories: data.totalCalories?.toLocaleString() || '0',
        totalWalks: data.totalWalks || 0,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch walk stats:', error);
      throw error;
    }
  },

  getWalkRecords: async (): Promise<WalkRecord[]> => {
    try {
      const response = await apiClient.get('/walks/my');
      const walks = Array.isArray(response.data) ? response.data : [];
      return walks.map(toWalkRecord);
    } catch (error: unknown) {
      console.error('Failed to fetch walk records:', error);
      throw error;
    }
  },

  getWalkDetail: async (walkId: number): Promise<WalkSession> => {
    try {
      const response = await apiClient.get(`/walks/${walkId}`);
      return response.data;
    } catch {
      throw new Error('산책 기록을 불러올 수 없습니다.');
    }
  },

  getWalkRanking: async (period: 'weekly' | 'monthly' = 'weekly'): Promise<WalkRankingEntry[]> => {
    try {
      const response = await apiClient.get(`/walks/ranking?period=${period}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch walk ranking:', error);
      throw error;
    }
  },

  getStaticMapImage: async (walkId: number, width: number, height: number): Promise<string | null> => {
    try {
      const response = await apiClient.get(`/maps/static/${walkId}?w=${width}&h=${height}`, {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch {
      return null;
    }
  },
};
