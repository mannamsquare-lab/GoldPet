import { apiClient } from './apiClient';

export interface AppNoticeResponse {
  id: number;
  type: string;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  targetScreen?: string;
  priority: number;
  isDismissible: boolean;
  isActive: boolean;
  startAt: string;
  endAt?: string;
  createdAt?: string;
}

export interface CreateAppNoticeRequest {
  type: string;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  targetScreen: string;
  priority: number;
  isDismissible: boolean;
  isActive?: boolean;
  startAt: string;
  endAt?: string;
}

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
};
