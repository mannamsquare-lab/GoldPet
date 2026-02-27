import { apiClient } from './apiClient';

export interface EmoticonResponse {
  id: number;
  name: string;
  packId: number;
  category: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface EmoticonPackResponse {
  id: number;
  name: string;
}

export interface CreateEmoticonRequest {
  name: string;
  packId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface UpdateEmoticonRequest {
  name?: string;
  packId?: number;
  imageUrl?: string;
  sortOrder?: number;
}

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
