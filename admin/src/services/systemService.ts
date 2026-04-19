import { typedClient } from './typedClient';
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
    const response = await typedClient.get('/api/v1/admin/system/info');
    return response.data as SystemInfo;
  },

  async getAdmins(): Promise<AdminUser[]> {
    const response = await typedClient.get('/api/v1/admin/system/admins');
    return response.data as unknown as AdminUser[];
  },

  async getMaintenanceStatus(): Promise<{ enabled: boolean }> {
    const response = await typedClient.get('/api/v1/admin/system/maintenance');
    return response.data as unknown as { enabled: boolean };
  },

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await typedClient.post('/api/v1/admin/system/maintenance', { enabled });
  },

  async getConfigs(): Promise<AppConfig[]> {
    const response = await typedClient.get('/api/v1/admin/system/configs');
    return response.data as AppConfig[];
  },

  async updateConfig(key: string, value: string): Promise<void> {
    await typedClient.post('/api/v1/admin/system/configs', { key, value });
  },
};
