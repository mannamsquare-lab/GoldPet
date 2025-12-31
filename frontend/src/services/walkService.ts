// Walk Service - API integration for Walk features

import apiClient from './api/client';

export interface WalkRecord {
  id: number;
  date: string;
  distance: string;
  duration: string;
  points: string;
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
}

// Mock data
const mockStats: WalkStats = {
  todayDistance: '1.25',
  todayCalories: '1,250',
  weeklyDistance: 8.5,
  monthlyDistance: 32.0,
  totalWalks: 42,
};

const mockRecords: WalkRecord[] = [
  { id: 1, date: '2025.12.21', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
  { id: 2, date: '2025.12.20', distance: '2.5 Km', duration: '총 55분', points: '25G 적립' },
  { id: 3, date: '2025.12.19', distance: '0.8 Km', duration: '총 20분', points: '8G 적립' },
  { id: 4, date: '2025.12.18', distance: '1.5 Km', duration: '총 40분', points: '15G 적립' },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

export const walkService = {
  getWalkStats: async (): Promise<WalkStats> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockStats;
    }

    try {
      const response = await apiClient.get('/walks/stats');
      return response.data;
    } catch {
      return mockStats;
    }
  },

  getWalkRecords: async (page = 0, size = 20): Promise<WalkRecord[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return mockRecords;
    }

    try {
      const response = await apiClient.get(`/walks?page=${page}&size=${size}`);
      return response.data.content || response.data;
    } catch {
      return mockRecords;
    }
  },

  startWalk: async (): Promise<{ success: boolean; sessionId: number; message: string }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { success: true, sessionId: Date.now(), message: '산책이 시작되었습니다!' };
    }

    try {
      const response = await apiClient.post('/walks/start');
      return {
        success: true,
        sessionId: response.data.id,
        message: '산책이 시작되었습니다!',
      };
    } catch {
      throw new Error('산책 시작에 실패했습니다.');
    }
  },

  stopWalk: async (sessionId: number, pathPoints?: { lat: number; lng: number }[]): Promise<{ success: boolean; message: string; summary: WalkRecord }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        success: true,
        message: '산책이 종료되었습니다.',
        summary: {
          id: sessionId,
          date: new Date().toLocaleDateString('ko-KR'),
          distance: '0.5 Km',
          duration: '총 10분',
          points: '5G 적립',
        },
      };
    }

    try {
      const response = await apiClient.post(`/walks/${sessionId}/stop`, { pathPoints });
      return {
        success: true,
        message: '산책이 종료되었습니다.',
        summary: response.data,
      };
    } catch {
      throw new Error('산책 종료에 실패했습니다.');
    }
  },

  updateLocation: async (sessionId: number, point: { lat: number; lng: number }): Promise<void> => {
    if (USE_MOCK) return;

    try {
      await apiClient.post(`/walks/${sessionId}/location`, point);
    } catch {
      // Ignore location update errors
    }
  },

  getWalkDetail: async (walkId: number): Promise<WalkSession> => {
    if (USE_MOCK) {
      return {
        id: walkId,
        startTime: '2025-12-21T10:00:00',
        endTime: '2025-12-21T10:30:00',
        distance: 1.5,
        calories: 120,
        pathPoints: [
          { lat: 37.5665, lng: 126.978 },
          { lat: 37.567, lng: 126.979 },
        ],
      };
    }

    try {
      const response = await apiClient.get(`/walks/${walkId}`);
      return response.data;
    } catch {
      throw new Error('산책 기록을 불러올 수 없습니다.');
    }
  },
};
