import { apiClient } from './apiClient';
import type {
  CacheInfoResponse,
  CacheClearResult,
  CacheClearLogResponse,
} from '../types/api';

// Generated aliases (Phase 3.11.4).
export type CacheInfo = CacheInfoResponse;
export type { CacheClearResult };
export type CacheClearLog = CacheClearLogResponse;

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
