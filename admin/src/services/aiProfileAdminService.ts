import { apiClient } from './apiClient';
import type { PageResponse } from '../types/api';

export interface AIRequestAdminResponse {
  id: number;
  userId: number;
  userNickname: string | null;
  petId: number;
  petName: string;
  type: string;
  sourceImageUrl: string;
  stylePrompt: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  resultUrl: string | null;
  errorMessage: string | null;
  goldCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIStyleAdminResponse {
  id: string;
  name: string;
  description: string | null;
  previewUrl: string | null;
  goldCost: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIStyleAdminRequest {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  goldCost: number;
  isActive: boolean;
  displayOrder: number;
}

export interface AIProfileStatsResponse {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  failedRequests: number;
  refundedRequests: number;
  totalGoldSpent: number;
  successRate: number;
  dailyBreakdown: { date: string; count: number; totalDistance: number }[];
  popularStyles: { styleId: string; styleName: string; count: number }[];
}

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
