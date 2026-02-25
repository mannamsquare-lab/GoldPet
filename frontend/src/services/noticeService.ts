import apiClient from './api/client';

export interface AppNoticeResponse {
  id: number;
  type: 'POPUP_MODAL' | 'MAINTENANCE' | 'EVENT_BANNER';
  title: string;
  content?: string;
  imageUrls: string[];
  linkUrl?: string;
  targetScreen?: string;
  priority: number;
  isDismissible: boolean;
  isActive: boolean;
  startAt: string;
  endAt?: string;
}

export const noticeService = {
  getActiveNotices: async (screen?: string): Promise<AppNoticeResponse[]> => {
    const params = screen ? { screen } : {};
    const response = await apiClient.get('/app/notices', { params });
    return response.data;
  },

  getMaintenanceNotice: async (): Promise<AppNoticeResponse | null> => {
    try {
      const response = await apiClient.get('/app/notices/maintenance');
      return response.data;
    } catch {
      return null;
    }
  },
};
