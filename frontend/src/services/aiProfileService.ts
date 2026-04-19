import apiClient from './api/client';
import type {
  AIStyleOption as AIStyleOptionDto,
  CreateAIProfileRequest as CreateAIProfileRequestDto,
  AIProfileRequestResponse as AIProfileRequestResponseDto,
  AIRequestType as AIRequestTypeAlias,
  ApplyProfileRequest,
} from '../types/api';

// Generated aliases (Phase 3.10).
export type AIStyleOption = AIStyleOptionDto;
export type AIRequestType = AIRequestTypeAlias;
export type CreateAIProfileRequest = CreateAIProfileRequestDto;
export type AIProfileRequestResponse = AIProfileRequestResponseDto;
// Backend type is `ApplyProfileRequest`; legacy frontend name kept.
export type ApplyToProfileRequest = ApplyProfileRequest;

class AIProfileService {
  async getStyles(): Promise<AIStyleOption[]> {
    const response = await apiClient.get<AIStyleOption[]>('/ai-profile/styles');
    return response.data;
  }

  async createRequest(request: CreateAIProfileRequest): Promise<AIProfileRequestResponse> {
    const response = await apiClient.post<AIProfileRequestResponse>('/ai-profile/requests', request);
    return response.data;
  }

  async getMyRequests(page: number): Promise<AIProfileRequestResponse[]> {
    const response = await apiClient.get<AIProfileRequestResponse[]>(`/ai-profile/requests?page=${page}`);
    return response.data;
  }

  async getRequest(requestId: number): Promise<AIProfileRequestResponse> {
    const response = await apiClient.get<AIProfileRequestResponse>(`/ai-profile/requests/${requestId}`);
    return response.data;
  }

  async getPendingCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/ai-profile/pending-count');
    return response.data.count;
  }

  async cancelRequest(requestId: number): Promise<void> {
    await apiClient.delete(`/ai-profile/requests/${requestId}`);
  }

  async applyToProfile(requestId: number, data: ApplyToProfileRequest): Promise<void> {
    await apiClient.post(`/ai-profile/requests/${requestId}/apply`, data);
  }

  async getLoadingTips(): Promise<string[]> {
    const response = await apiClient.get<{ id: number; content: string; displayOrder: number; isActive: boolean }[]>('/ai-profile/loading-tips');
    return response.data.map(tip => tip.content);
  }
}

export const aiProfileService = new AIProfileService();
