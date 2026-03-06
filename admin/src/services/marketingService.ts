import { apiClient } from './apiClient';

interface NotificationTemplate {
  id: number;
  title: string;
  body: string;
  category: string;
  createdAt: string;
}

interface NotificationTemplateRequest {
  title: string;
  body: string;
  category: string;
}

interface SendNotificationRequest {
  templateId: number | null;
  title: string | null;
  body: string | null;
  targetType: 'ALL' | 'USER';
  targetUserIds: number[] | null;
}

interface SendNotificationResult {
  successCount: number;
  failCount: number;
}

interface DeliveryLog {
  id: number;
  title: string;
  targetType: string;
  sentCount: number;
  sentAt: string;
}

export const marketingService = {
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get('/marketing/notifications/templates');
    return response.data;
  },

  createTemplate: async (request: NotificationTemplateRequest): Promise<NotificationTemplate> => {
    const response = await apiClient.post('/marketing/notifications/templates', request);
    return response.data;
  },

  updateTemplate: async (id: number, request: NotificationTemplateRequest): Promise<NotificationTemplate> => {
    const response = await apiClient.put(`/marketing/notifications/templates/${id}`, request);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/notifications/templates/${id}`);
  },

  sendNotification: async (request: SendNotificationRequest): Promise<SendNotificationResult> => {
    const response = await apiClient.post('/marketing/notifications/send', request);
    return response.data;
  },

  getDeliveryLogs: async (page = 0, size = 20): Promise<DeliveryLog[]> => {
    const response = await apiClient.get('/marketing/notifications/logs', {
      params: { page, size }
    });
    return response.data;
  },

  getBanners: async (): Promise<Record<string, unknown>[]> => {
    const response = await apiClient.get('/marketing/banners');
    return response.data;
  },

  createBanner: async (request: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const response = await apiClient.post('/marketing/banners', request);
    return response.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/banners/${id}`);
  },

  getCampaigns: async (): Promise<Record<string, unknown>[]> => {
    const response = await apiClient.get('/marketing/campaigns');
    return response.data;
  },

  createCampaign: async (request: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const response = await apiClient.post('/marketing/campaigns', request);
    return response.data;
  }
};

export type {
  NotificationTemplate,
  NotificationTemplateRequest,
  SendNotificationRequest,
  SendNotificationResult,
  DeliveryLog
};
