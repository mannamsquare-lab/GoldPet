import { apiClient } from './apiClient';

export interface CacheInfo {
  name: string;
  description: string;
  ttlSeconds: number;
  isActive: boolean;
}

export interface CacheClearResult {
  success: boolean;
  cacheName: string;
  message: string;
  clearedAt: string;
}

export interface CacheClearLog {
  cacheName: string;
  clearedBy: string;
  clearedAt: string;
  reason: string | null;
}

export const cacheService = {
  async getStatus(): Promise<CacheInfo[]> {
    const response = await apiClient.get('/cache/status');
    return response.data;
  },

  async clearCache(cacheName: string): Promise<CacheClearResult> {
    const response = await apiClient.post('/cache/clear', { cacheName });
    return response.data;
  },

  async clearAll(): Promise<CacheClearResult> {
    const response = await apiClient.post('/cache/clear-all');
    return response.data;
  },

  async getLogs(page: number = 0, size: number = 20): Promise<CacheClearLog[]> {
    const response = await apiClient.get('/cache/logs', {
      params: { page, size }
    });
    return response.data;
  },
};
