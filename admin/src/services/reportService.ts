import { apiClient } from './apiClient';
import type { PageResponse, ReportType, ReportStatus, ReportActionType } from '../types/api';

export interface ReportItem {
  id: number;
  type: ReportType;
  targetId: number;
  targetPreview: string | null;
  reason: string;
  reporterNickname: string;
  reporterId: number;
  status: ReportStatus;
  createdAt: string | null;
  resolvedAt: string | null;
  actionType: ReportActionType | null;
  adminNote: string | null;
  resolvedByName: string | null;
}

export const reportService = {
  async getReports(params: { page?: number; status?: string }): Promise<PageResponse<ReportItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.status) queryParams.set('status', params.status);
    
    const response = await apiClient.get(`/reports?${queryParams.toString()}`);
    return response.data;
  },

  async getReportDetail(reportId: number): Promise<ReportItem> {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  },

  async resolveReport(reportId: number, actionType: string, adminNote?: string): Promise<void> {
    await apiClient.post(`/reports/${reportId}/resolve`, { actionType, adminNote });
  },

  async dismissReport(reportId: number): Promise<void> {
    await apiClient.post(`/reports/${reportId}/dismiss`);
  },
};
