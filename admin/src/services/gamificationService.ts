import { apiClient } from './apiClient';
import type { BadgeResponse } from '../types/api';

// Generated alias (Phase 3.11.1). Note: admin Badge previously included
// frontend-only `isActive` and `earnedCount` fields not in backend BadgeResponse.
// Restored manually if call sites need them; for now use generated shape directly.
export type Badge = BadgeResponse;

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
