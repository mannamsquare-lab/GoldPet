import { apiClient } from './apiClient';
import type {
  PageResponse,
  WalkAdminResponse,
  WalkDetailResponse,
  WalkSpotAdminDto,
  WalkStatsDetailResponse,
} from '../types/api';

// Re-export OpenAPI-generated types (Phase 3.9). `WalkSpotDto` keeps its prior local
// name for callers; underlying shape now comes from `Schemas['WalkSpotAdminDto']`.
export type { WalkAdminResponse, WalkDetailResponse, WalkStatsDetailResponse };
export type WalkSpotDto = WalkSpotAdminDto;

export interface GetWalksParams {
  page?: number;
  size?: number;
  userNickname?: string;
  startDate?: string;
  endDate?: string;
  minDistance?: number;
  maxDistance?: number;
}

export interface GetDetailedStatsParams {
  startDate?: string;
  endDate?: string;
}

export const walkAdminService = {
  async getWalks(params: GetWalksParams = {}): Promise<PageResponse<WalkAdminResponse>> {
    const response = await apiClient.get('/walks', { params });
    return response.data;
  },

  async getWalkDetail(id: number): Promise<WalkDetailResponse> {
    const response = await apiClient.get(`/walks/${id}`);
    return response.data;
  },

  async deleteWalk(id: number, reason: string): Promise<void> {
    await apiClient.delete(`/walks/${id}`, { data: { reason } });
  },

  async getDetailedStats(params: GetDetailedStatsParams = {}): Promise<WalkStatsDetailResponse> {
    const response = await apiClient.get('/walks/stats/detailed', { params });
    return response.data;
  },
};
