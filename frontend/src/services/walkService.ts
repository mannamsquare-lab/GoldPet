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
  endAddress?: string;
  isPublic?: boolean;
  userNickname?: string;
  userProfileImageUrl?: string;
  hasPath?: boolean;
  petNames?: string[];
  petProfileImageUrls?: (string | null)[];
}

export interface WalkStats {
  todayDistance: string;
  todayCalories: string;
  weeklyDistance?: number;
  monthlyDistance?: number;
  totalWalks?: number;
}

export interface WalkSpot {
  id?: number;
  latitude: number;
  longitude: number;
  type: 'PEE' | 'POOP' | 'PHOTO' | 'PROBLEM' | 'OTHER';
  timestamp: string;
  imageUrl?: string;
  note?: string;
  hiddenFromPublic?: boolean;
}

export interface WalkPhotoItem {
  id: number;
  imageUrl: string | null;
  note: string | null;
  walkDate: string;
  walkId: number;
  petName: string | null;
  petImageUrl: string | null;
  hiddenFromPublic?: boolean;
}

export interface WalkSession {
  id: number;
  userId?: number;
  startTime: string;
  endTime?: string;
  distance: number;
  calories: number;
  durationSeconds?: number;
  pathPoints?: { lat: number; lng: number }[];
  spots?: WalkSpot[];
  startAddress?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  petNames?: string[];
  petIds?: number[];
  petProfileImageUrls?: (string | null)[];
}

export interface WalkRankingEntry {
  rank: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  petName: string | null;
  petProfileImageUrl: string | null;
  totalDistanceKm: number;
  totalMinutes: number;
  totalGold: number;
  walkCount: number;
}

export interface WalkCoupleRanking {
  yearMonth: string;
  bestCouple: WalkRankingEntry | null;
  rankings: WalkRankingEntry[];
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
  endAddress?: string;
  isPublic?: boolean;
  userNickname?: string;
  userProfileImageUrl?: string;
  hasPath?: boolean;
  petNames?: string[];
  petProfileImageUrls?: (string | null)[];
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
    startAddress: shortenAddress(walk.startAddress) ?? undefined,
    endAddress: shortenAddress(walk.endAddress) ?? undefined,
    isPublic: walk.isPublic ?? true,
    userNickname: walk.userNickname ?? undefined,
    userProfileImageUrl: walk.userProfileImageUrl ?? undefined,
    hasPath: walk.hasPath,
    petNames: walk.petNames,
    petProfileImageUrls: walk.petProfileImageUrls,
  };
}

function shortenAddress(address: string | null | undefined): string | undefined {
  if (!address) return undefined;
  return address.replace(/^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)\s*/, '');
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

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
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
      const response = await apiClient.get('/walks/my', { params: { size: 2000 } });
      const data = response.data;
      const walks = Array.isArray(data) ? data : (data.content ?? []);
      return walks.map(toWalkRecord);
    } catch (error: unknown) {
      console.error('Failed to fetch walk records:', error);
      throw error;
    }
  },

  getWalkRecordsPaged: async (page: number, size = 10, yearMonth?: string): Promise<PageResponse<WalkRecord>> => {
    try {
      const response = await apiClient.get('/walks/my', { params: { page, size, yearMonth } });
      const data = response.data;
      return {
        ...data,
        content: data.content.map(toWalkRecord),
      };
    } catch (error: unknown) {
      console.error('Failed to fetch walk records:', error);
      throw error;
    }
  },

  getPublicWalksPaged: async (page: number, size = 10, yearMonth?: string, province?: string): Promise<PageResponse<WalkRecord>> => {
    try {
      const response = await apiClient.get('/walks/public', { params: { page, size, yearMonth, province } });
      const data = response.data;
      return {
        ...data,
        content: data.content.map(toWalkRecord),
      };
    } catch (error: unknown) {
      console.error('Failed to fetch public walk records:', error);
      throw error;
    }
  },

  getWalkDetail: async (walkId: number): Promise<WalkSession> => {
    try {
      const response = await apiClient.get(`/walks/${walkId}`);
      const data = response.data;
      return {
        id: data.id,
        userId: data.userId,
        startTime: data.startTime,
        endTime: data.endTime,
        distance: data.distanceKm ?? 0,
        calories: data.caloriesBurned ?? 0,
        durationSeconds: data.durationSeconds,
        pathPoints: data.path ? pathToCoords(data.path) : undefined,
        spots: data.spots ?? [],
        startAddress: data.startAddress,
        startLatitude: data.startLatitude,
        startLongitude: data.startLongitude,
        endLatitude: data.endLatitude,
        endLongitude: data.endLongitude,
        petNames: data.petNames,
        petIds: data.petIds,
        petProfileImageUrls: data.petProfileImageUrls,
      };
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

  getMonthlyRanking: async (yearMonth: string, size: number = 10, province?: string): Promise<WalkCoupleRanking> => {
    const response = await apiClient.get('/walks/ranking', {
      params: { mode: 'calendar', yearMonth, size, province },
    });
    return response.data;
  },

  getMyPhotos: async (params: { yearMonth?: string; page: number; size: number }): Promise<PageResponse<WalkPhotoItem>> => {
    const response = await apiClient.get('/walks/my/photos', { params });
    return response.data;
  },

  getPublicPhotos: async (params: { page: number; size: number }): Promise<PageResponse<WalkPhotoItem>> => {
    const response = await apiClient.get('/walks/public/photos', { params });
    return response.data;
  },

  updateSpotNote: async (walkId: number, spotId: number, note: string | null): Promise<WalkPhotoItem> => {
    const response = await apiClient.patch(`/walks/${walkId}/spots/${spotId}`, { note });
    return response.data;
  },

  updateSpotVisibility: async (walkId: number, spotId: number, hiddenFromPublic: boolean): Promise<WalkPhotoItem> => {
    const response = await apiClient.patch(`/walks/${walkId}/spots/${spotId}/visibility`, { hiddenFromPublic });
    return response.data;
  },

  getUserPublicWalksRaw: async (userId: number): Promise<unknown[]> => {
    const response = await apiClient.get('/walks/public', { params: { userId, size: 2000 } });
    const data = response.data;
    return Array.isArray(data) ? data : (data.content ?? []);
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
