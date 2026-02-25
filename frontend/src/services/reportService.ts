import apiClient from './api/client';

export type ReportType = 'POST' | 'COMMENT' | 'USER' | 'CHAT';

export interface CreateReportRequest {
  type: ReportType;
  targetId: number;
  reason: string;
}

export const reportService = {
  createReport: async (request: CreateReportRequest) => {
    return apiClient.post('/reports', request);
  },
};
