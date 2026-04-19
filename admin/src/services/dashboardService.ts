import { apiClient } from './apiClient';
import type {
  DashboardStatsResponse,
  DashboardChartsResponse,
  RecentActivityItem,
} from '../types/api';

// Generated aliases (Phase 3.11.4).
export type DashboardStats = DashboardStatsResponse;
export type DashboardCharts = DashboardChartsResponse;
export type RecentActivity = RecentActivityItem;

// Manual: not in spec (chart series points are inline number/date pairs).
export interface ChartDataPoint {
  date: string;
  value: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  async getCharts(days = 30): Promise<DashboardCharts> {
    const response = await apiClient.get(`/dashboard/charts?days=${days}`);
    return response.data;
  },

  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },
};
