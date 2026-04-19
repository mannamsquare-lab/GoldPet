import { apiClient } from './apiClient';
import type {
  EmoticonResponse,
  EmoticonPackResponse,
  CreateEmoticonRequest,
  UpdateEmoticonRequest,
} from '../types/api';

// Re-export under historical local names (Phase 3.11.1).
export type {
  EmoticonResponse,
  EmoticonPackResponse,
  CreateEmoticonRequest,
  UpdateEmoticonRequest,
};

export const emoticonService = {
  getAll: async (): Promise<EmoticonResponse[]> => {
    const response = await apiClient.get('/emoticons');
    return response.data;
  },

  getPacks: async (): Promise<EmoticonPackResponse[]> => {
    const response = await apiClient.get('/emoticons/packs');
    return response.data;
  },

  create: async (data: CreateEmoticonRequest): Promise<EmoticonResponse> => {
    const response = await apiClient.post('/emoticons', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEmoticonRequest): Promise<EmoticonResponse> => {
    const response = await apiClient.put(`/emoticons/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/emoticons/${id}`);
  },

  toggleActive: async (id: number): Promise<EmoticonResponse> => {
    const response = await apiClient.patch(`/emoticons/${id}/toggle`);
    return response.data;
  },
};
