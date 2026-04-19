import apiClient from './api/client';
import type { BadgeResponse } from '../types/api';

// Generated alias (Phase 3.10). Backend exposes nullable date/condition fields as
// `optional` — frontend consumers should treat absent and null interchangeably.
export type Badge = BadgeResponse;

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
