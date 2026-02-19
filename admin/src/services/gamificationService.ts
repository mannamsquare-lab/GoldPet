import { apiClient } from './apiClient';

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  conditionType: string | null;
  conditionValue: number | null;
  isActive: boolean;
  rewardGold: number | null;
  startDate: string | null;
  endDate: string | null;
  isRepeatable: boolean;
  repeatCycle: string | null;
  earnedCount: number;
}

export const gamificationService = {
  async getBadges(): Promise<Badge[]> {
    const response = await apiClient.get('/gamification/badges');
    return response.data;
  },

  async createBadge(data: {
    name: string;
    description: string;
    imageUrl?: string;
    conditionType?: string;
    conditionValue?: number;
    rewardGold?: number;
    startDate?: string;
    endDate?: string;
    isRepeatable?: boolean;
    repeatCycle?: string;
  }): Promise<Badge> {
    const response = await apiClient.post('/gamification/badges', data);
    return response.data;
  },

  async updateBadge(badgeId: number, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    conditionType?: string;
    conditionValue?: number;
    isActive?: boolean;
    rewardGold?: number;
    startDate?: string;
    endDate?: string;
    isRepeatable?: boolean;
    repeatCycle?: string;
  }): Promise<Badge> {
    const response = await apiClient.put(`/gamification/badges/${badgeId}`, data);
    return response.data;
  },
};
