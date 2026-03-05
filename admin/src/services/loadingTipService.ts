import { apiClient } from './apiClient';

export interface AILoadingTipResponse {
  id: number;
  content: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateLoadingTipRequest {
  content: string;
  displayOrder: number;
}

export interface UpdateLoadingTipRequest {
  content?: string;
  displayOrder?: number;
  isActive?: boolean;
}

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
