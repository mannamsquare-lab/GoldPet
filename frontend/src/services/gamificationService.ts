import apiClient from './api/client';

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  conditionType?: string | null;
  conditionValue?: number | null;
  rewardGold?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isRepeatable?: boolean;
  repeatCycle?: string | null;
  acquiredAt?: string | null;
}

export const gamificationService = {
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get('/gamification/badges');
    return response.data;
  },

  getMyBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get('/gamification/badges/my');
    return response.data;
  },
};
