import { apiClient } from './apiClient';
import type {
  WalkRankingAdminResponse,
  BestWalkCoupleResponse,
  BestWalkCoupleRequest,
} from '../types/api';

// Re-export under historical local names (Phase 3.9).
export type WalkRankingAdminEntry = WalkRankingAdminResponse;
export type { BestWalkCoupleResponse };
export type SetBestCoupleRequest = BestWalkCoupleRequest;

export const walkRankingService = {
  async getRanking(yearMonth: string, size = 50): Promise<WalkRankingAdminEntry[]> {
    const response = await apiClient.get('/walks/ranking', { params: { yearMonth, size } });
    return response.data;
  },

  async getBestCouple(yearMonth: string): Promise<BestWalkCoupleResponse | null> {
    try {
      const response = await apiClient.get('/walks/best-couple', { params: { yearMonth } });
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 404) return null;
      throw err;
    }
  },

  async setBestCouple(request: SetBestCoupleRequest): Promise<BestWalkCoupleResponse> {
    const response = await apiClient.post('/walks/best-couple', request);
    return response.data;
  },

  async deleteBestCouple(yearMonth: string): Promise<void> {
    await apiClient.delete(`/walks/best-couple/${yearMonth}`);
  },
};
