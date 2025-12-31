import { apiClient } from './apiClient';

export interface ReportItem {
  id: number;
  type: 'POST' | 'COMMENT' | 'USER' | 'CHAT';
  targetId: number;
  targetPreview: string | null;
  reason: string;
  reporterNickname: string;
  reporterId: number;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string | null;
  resolvedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export const reportService = {
  async getReports(params: { page?: number; status?: string }): Promise<PageResponse<ReportItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.status) queryParams.set('status', params.status);
    
    const response = await apiClient.get(`/reports?${queryParams.toString()}`);
    return response.data;
  },

  async resolveReport(reportId: number): Promise<void> {
    await apiClient.post(`/reports/${reportId}/resolve`);
  },

  async dismissReport(reportId: number): Promise<void> {
    await apiClient.post(`/reports/${reportId}/dismiss`);
  },
};
