import { apiClient } from './apiClient';
import type { SystemInfoResponse, AppConfigResponse } from '../types/api';

// Generated aliases (Phase 3.11.4).
export type SystemInfo = SystemInfoResponse;
export type AppConfig = AppConfigResponse;

// Manual: not in spec.
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLogin: string | null;
}

export const systemService = {
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await apiClient.get('/system/info');
    return response.data;
  },

  async getAdmins(): Promise<AdminUser[]> {
    const response = await apiClient.get('/system/admins');
    return response.data;
  },

  async getMaintenanceStatus(): Promise<{ enabled: boolean }> {
    const response = await apiClient.get('/system/maintenance');
    return response.data;
  },

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await apiClient.post('/system/maintenance', { enabled });
  },

  async getConfigs(): Promise<AppConfig[]> {
    const response = await apiClient.get('/system/configs');
    return response.data;
  },

  async updateConfig(key: string, value: string): Promise<void> {
    await apiClient.post('/system/configs', { key, value });
  },
};

