import { apiClient } from './apiClient';

export interface SystemInfo {
  version: string;
  environment: string;
  serverTime: string;
  uptime: string;
  dbStatus: string;
  cacheStatus: string;
  storageUsed: number;
  storageTotal: number;
}

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

export interface AppConfig {
    key: string;
    value: string;
    description?: string;
}
