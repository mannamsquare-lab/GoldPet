import { apiClient } from './apiClient';
import type {
  PageResponse,
  StoolAnalysisStatsResponse,
  DailyCount,
  AdminStoolAnalysisItem,
} from '../types/api';

// Generated aliases (Phase 3.11.4).
export type StoolAnalysisStats = StoolAnalysisStatsResponse;
export type { DailyCount, AdminStoolAnalysisItem };

export const stoolAnalysisAdminService = {
  async getStats(): Promise<StoolAnalysisStats> {
    const response = await apiClient.get('/stool-analyses/stats');
    return response.data;
  },

  async getAnalyses(params: { page?: number; status?: string }): Promise<PageResponse<AdminStoolAnalysisItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.status) queryParams.set('status', params.status);
    const response = await apiClient.get(`/stool-analyses?${queryParams.toString()}`);
    return response.data;
  },

  async getDailyLimit(): Promise<number> {
    const response = await apiClient.get('/system/configs');
    const configs: { key: string; value: string }[] = response.data;
    const setting = configs.find((c) => c.key === 'stool.analysis.daily_limit');
    return setting ? parseInt(setting.value, 10) : 10;
  },

  async updateDailyLimit(value: number): Promise<void> {
    await apiClient.post('/system/configs', {
      key: 'stool.analysis.daily_limit',
      value: value.toString(),
    });
  },
};
