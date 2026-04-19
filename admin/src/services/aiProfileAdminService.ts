import { apiClient } from './apiClient';
import type {
  PageResponse,
  AIRequestAdminResponse,
  AIStyleAdminResponse,
  AIStyleAdminRequest,
  AIProfileStatsResponse,
} from '../types/api';

// Re-export under historical local names (Phase 3.11.1).
export type {
  AIRequestAdminResponse,
  AIStyleAdminResponse,
  AIStyleAdminRequest,
  AIProfileStatsResponse,
};

export const aiProfileAdminService = {
  async getRequests(page: number = 0, size: number = 20, status?: string): Promise<PageResponse<AIRequestAdminResponse>> {
    const params: Record<string, string | number> = { page, size };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get('/ai-profile/requests', { params });
    return response.data;
  },

  async getRequestDetail(id: number): Promise<AIRequestAdminResponse> {
    const response = await apiClient.get(`/ai-profile/requests/${id}`);
    return response.data;
  },

  async retryRequest(id: number): Promise<AIRequestAdminResponse> {
    const response = await apiClient.post(`/ai-profile/requests/${id}/retry`);
    return response.data;
  },

  async refundRequest(id: number): Promise<void> {
    await apiClient.post(`/ai-profile/requests/${id}/refund`);
  },

  async forceFailRequest(id: number): Promise<void> {
    await apiClient.post(`/ai-profile/requests/${id}/force-fail`);
  },

  async getStyles(): Promise<AIStyleAdminResponse[]> {
    const response = await apiClient.get('/ai-profile/styles');
    return response.data;
  },

  async createStyle(data: AIStyleAdminRequest): Promise<AIStyleAdminResponse> {
    const response = await apiClient.post('/ai-profile/styles', data);
    return response.data;
  },

  async updateStyle(id: string, data: AIStyleAdminRequest): Promise<AIStyleAdminResponse> {
    const response = await apiClient.put(`/ai-profile/styles/${id}`, data);
    return response.data;
  },

  async deleteStyle(id: string): Promise<void> {
    await apiClient.delete(`/ai-profile/styles/${id}`);
  },

  async toggleStyle(id: string): Promise<AIStyleAdminResponse> {
    const response = await apiClient.patch(`/ai-profile/styles/${id}/toggle`);
    return response.data;
  },

  async getStats(): Promise<AIProfileStatsResponse> {
    const response = await apiClient.get('/ai-profile/stats');
    return response.data;
  },
};
