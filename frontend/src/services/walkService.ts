// import { apiClient } from './api/client';

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
}

export const walkService = {
  getWalkStats: async (): Promise<WalkStats> => {
    // Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          todayDistance: '1.25',
          todayCalories: '1,250',
        });
      }, 500);
    });
  },

  getWalkRecords: async (): Promise<WalkRecord[]> => {
    // Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, date: '2025.10.28', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
          { id: 2, date: '2025.10.27', distance: '2.5 Km', duration: '총 55분', points: '25G 적립' },
          { id: 3, date: '2025.10.26', distance: '0.8 Km', duration: '총 20분', points: '8G 적립' },
          { id: 4, date: '2025.10.25', distance: '1.5 Km', duration: '총 40분', points: '15G 적립' },
        ]);
      }, 600);
    });
  },

  startWalk: async (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: '산책이 시작되었습니다!' });
        }, 500);
    });
  },

  stopWalk: async (): Promise<{ success: boolean; message: string; summary: WalkRecord }> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve({
                  success: true,
                  message: '산책이 종료되었습니다.',
                  summary: {
                      id: 999,
                      date: new Date().toLocaleDateString(),
                      distance: '0.5 Km',
                      duration: '총 10분',
                      points: '5G 적립'
                  }
              });
          }, 500);
      });
  }
};
