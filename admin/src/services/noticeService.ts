import { apiClient } from './apiClient';
import type {
  AppNoticeResponse,
  CreateAppNoticeRequest,
} from '../types/api';

// Re-export under historical local names (Phase 3.11.4).
export type { AppNoticeResponse, CreateAppNoticeRequest };

export const noticeService = {
  getAllNotices: async (): Promise<AppNoticeResponse[]> => {
    const response = await apiClient.get('/notices');
    return response.data;
  },
  createNotice: async (request: CreateAppNoticeRequest): Promise<AppNoticeResponse> => {
    const response = await apiClient.post('/notices', request);
    return response.data;
  },
  updateNotice: async (id: number, request: Partial<CreateAppNoticeRequest>): Promise<AppNoticeResponse> => {
    const response = await apiClient.put(`/notices/${id}`, request);
    return response.data;
  },
  deleteNotice: async (id: number): Promise<void> => {
    await apiClient.delete(`/notices/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'notice');
    const response = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};
