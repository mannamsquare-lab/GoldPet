import { typedClient } from './typedClient';
import { apiClient } from './apiClient';
import type { SystemInfoResponse, AppConfigResponse } from '../types/api';

export interface BackupJob {
  id: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  triggeredByAdminId?: number;
  triggeredByAdminEmail?: string;
  triggerType: 'AUTO_CRON' | 'MANUAL';
  startedAt?: string;
  finishedAt?: string;
  filePath?: string;
  fileSizeBytes?: number;
  errorMessage?: string;
  createdAt: string;
}

export type SystemInfo = SystemInfoResponse;
export type AppConfig = AppConfigResponse;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin: string | null;
}

export interface AdminCreateRequest {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
}

export interface AdminCreateResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  temporaryPassword?: string;
}

export interface AdminUpdateRequest {
  name?: string;
  role?: string;
  isActive?: boolean;
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

  async createAdmin(data: AdminCreateRequest): Promise<AdminCreateResponse> {
    const response = await apiClient.post<AdminCreateResponse>('/system/admins', data);
    return response.data;
  },

  async updateAdmin(id: number, data: AdminUpdateRequest): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(`/system/admins/${id}`, data);
    return response.data;
  },

  async deleteAdmin(id: number): Promise<void> {
    await apiClient.delete(`/system/admins/${id}`);
  },

  async resetAdminPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{ temporaryPassword: string }>(`/system/admins/${id}/reset-password`, {});
    return response.data;
  },

  async triggerBackup(): Promise<BackupJob> {
    const { data } = await apiClient.post<BackupJob>('/system/backup');
    return data;
  },

  async getBackupJobs(limit = 20): Promise<BackupJob[]> {
    const { data } = await apiClient.get<BackupJob[]>('/system/backup/jobs', { params: { limit } });
    return data;
  },
};
