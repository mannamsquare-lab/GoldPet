import { typedClient } from './typedClient';
import type { BadgeResponse } from '../types/api';

// Generated alias (Phase 3.11.1). Note: admin Badge previously included
// frontend-only `isActive` and `earnedCount` fields not in backend BadgeResponse.
// Restored manually if call sites need them; for now use generated shape directly.
export type Badge = BadgeResponse;

export const gamificationService = {
  async getBadges(): Promise<Badge[]> {
    const response = await typedClient.get('/api/v1/admin/gamification/badges');
    return response.data as Badge[];
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
    const body = data as unknown as Parameters<typeof typedClient.post<'/api/v1/admin/gamification/badges'>>[1];
    const response = await typedClient.post('/api/v1/admin/gamification/badges', body);
    return response.data as Badge;
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
    const body = data as unknown as Parameters<typeof typedClient.putPath<'/api/v1/admin/gamification/badges/{badgeId}'>>[2];
    const response = await typedClient.putPath(
      '/api/v1/admin/gamification/badges/{badgeId}',
      { badgeId },
      body,
    );
    return response.data as Badge;
  },
};
