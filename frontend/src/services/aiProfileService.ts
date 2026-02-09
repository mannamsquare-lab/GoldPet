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
  stylePrompt?: string;
}

export interface AIProfileRequestResponse {
  id: number;
  petId: number;
  type: AIRequestType;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  sourceImageUrl: string;
  resultImageUrl: string | null;
  stylePrompt: string | null;
  createdAt: string;
  completedAt: string | null;
}

const USE_MOCK = true;

const mockStyles: AIStyleOption[] = [
  { id: 'cartoon', name: '카툰 스타일', description: '귀여운 카툰 느낌으로 변환', previewUrl: '/assets/images/ai/style_cartoon.jpg', goldCost: 50 },
  { id: 'watercolor', name: '수채화 스타일', description: '부드러운 수채화 느낌으로 변환', previewUrl: '/assets/images/ai/style_watercolor.jpg', goldCost: 50 },
  { id: 'pixel', name: '픽셀 아트', description: '레트로 픽셀 아트 스타일', previewUrl: '/assets/images/ai/style_pixel.jpg', goldCost: 30 },
  { id: 'realistic', name: '사실적 스타일', description: '고품질 사실적 이미지', previewUrl: '/assets/images/ai/style_realistic.jpg', goldCost: 100 },
];

const mockRequest: AIProfileRequestResponse = {
  id: 1,
  petId: 1,
  type: 'IMAGE',
  status: 'COMPLETED',
  sourceImageUrl: '/assets/images/common/pet_none_img.svg',
  resultImageUrl: '/assets/images/main/main_slide_butler01.jpg',
  stylePrompt: 'cartoon',
  createdAt: '2025-12-21T10:00:00',
  completedAt: '2025-12-21T10:05:00',
};

class AIProfileService {
  async getStyles(): Promise<AIStyleOption[]> {
    if (USE_MOCK) {
      return Promise.resolve(mockStyles);
    }
    const response = await apiClient.get<AIStyleOption[]>('/ai-profile/styles');
    return response.data;
  }

  async createRequest(request: CreateAIProfileRequest): Promise<AIProfileRequestResponse> {
    if (USE_MOCK) {
      return Promise.resolve(mockRequest);
    }
    const response = await apiClient.post<AIProfileRequestResponse>('/ai-profile/requests', request);
    return response.data;
  }

  async getMyRequests(page: number): Promise<AIProfileRequestResponse[]> {
    if (USE_MOCK) {
      return Promise.resolve([mockRequest]);
    }
    const response = await apiClient.get<AIProfileRequestResponse[]>(`/ai-profile/requests?page=${page}`);
    return response.data;
  }

  async getRequest(requestId: number): Promise<AIProfileRequestResponse> {
    if (USE_MOCK) {
      return Promise.resolve(mockRequest);
    }
    const response = await apiClient.get<AIProfileRequestResponse>(`/ai-profile/requests/${requestId}`);
    return response.data;
  }

  async getPendingCount(): Promise<number> {
    if (USE_MOCK) {
      return Promise.resolve(0);
    }
    const response = await apiClient.get<number>('/ai-profile/pending-count');
    return response.data;
  }

  async cancelRequest(requestId: number): Promise<void> {
    if (USE_MOCK) {
      return Promise.resolve();
    }
    await apiClient.delete(`/ai-profile/requests/${requestId}`);
  }
}

export const aiProfileService = new AIProfileService();
