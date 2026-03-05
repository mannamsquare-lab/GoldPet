import { apiClient } from './apiClient';

export interface WalkRankingAdminEntry {
  rank: number;
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  petId: number | null;
  petName: string | null;
  petProfileImageUrl: string | null;
  totalDistanceKm: number;
  totalMinutes: number;
  totalGold: number;
  walkCount: number;
}

export interface BestWalkCoupleResponse {
  yearMonth: string;
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  petId: number;
  petName: string;
  petProfileImageUrl: string | null;
  selectedBy: number | null;
  createdAt: string;
}

export interface SetBestCoupleRequest {
  yearMonth: string;
  userId: number;
  petId: number;
}

export const walkRankingService = {
  async getRanking(yearMonth: string, size = 50): Promise<WalkRankingAdminEntry[]> {
    const response = await apiClient.get('/walks/ranking', { params: { yearMonth, size } });
    return response.data;
  },

  async getBestCouple(yearMonth: string): Promise<BestWalkCoupleResponse | null> {
    try {
      const response = await apiClient.get('/walks/best-couple', { params: { yearMonth } });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
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
