import { apiClient } from './apiClient';

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalPets: number;
  totalWalks: number;
  totalDistance: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
  revenue: number;
  goldCirculation: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardCharts {
  userGrowth: ChartDataPoint[];
  walkActivity: ChartDataPoint[];
  revenue: ChartDataPoint[];
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
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
