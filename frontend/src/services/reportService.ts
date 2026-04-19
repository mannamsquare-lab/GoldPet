import apiClient from './api/client';
import type { ReportType, CreateReportRequest } from '../types/api';

export type { ReportType, CreateReportRequest };

export const reportService = {
  createReport: async (request: CreateReportRequest) => {
    return apiClient.post('/reports', request);
  },
};
