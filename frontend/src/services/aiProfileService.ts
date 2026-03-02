import apiClient from './api/client';

export interface AIStyleOption {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  goldCost: number;
}

export type AIRequestType = 'IMAGE' | 'VIDEO' | 'AVATAR';

export interface CreateAIProfileRequest {
  petId: number;
  type: AIRequestType;
  sourceImageUrl: string;
  stylePrompt?: string | null;
  mode?: 'SIMPLE' | 'CUSTOM';
  petType?: 'dog' | 'cat' | 'other';
}

export interface AIProfileRequestResponse {
  id: number;
  petId: number;
  petName: string;
  type: AIRequestType;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  sourceImageUrl: string;
  resultUrl: string | null;
  stylePrompt: string | null;
  errorMessage: string | null;
  goldCost: number;
  createdAt: string;
}

export interface ApplyToProfileRequest {
  applyAs: 'MAIN' | 'ADDITIONAL';
  petId: number;
}

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
}

export const aiProfileService = new AIProfileService();
