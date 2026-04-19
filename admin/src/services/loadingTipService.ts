import { apiClient } from './apiClient';
import type {
  AILoadingTipResponse,
  CreateLoadingTipRequest,
  UpdateLoadingTipRequest,
} from '../types/api';

// Re-export under historical local names (Phase 3.11.1).
export type {
  AILoadingTipResponse,
  CreateLoadingTipRequest,
  UpdateLoadingTipRequest,
};

export const loadingTipService = {
  getAllTips: async (): Promise<AILoadingTipResponse[]> => {
    const response = await apiClient.get('/ai-profile/loading-tips');
    return response.data;
  },
  createTip: async (request: CreateLoadingTipRequest): Promise<AILoadingTipResponse> => {
    const response = await apiClient.post('/ai-profile/loading-tips', request);
    return response.data;
  },
  updateTip: async (id: number, request: UpdateLoadingTipRequest): Promise<AILoadingTipResponse> => {
    const response = await apiClient.put(`/ai-profile/loading-tips/${id}`, request);
    return response.data;
  },
  deleteTip: async (id: number): Promise<void> => {
    await apiClient.delete(`/ai-profile/loading-tips/${id}`);
  },
};
