import { typedClient } from './typedClient';
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
    const response = await typedClient.get('/api/v1/admin/cache/status');
    return response.data as CacheInfo[];
  },

  async clearCache(cacheName: string): Promise<CacheClearResult> {
    const response = await typedClient.post('/api/v1/admin/cache/clear', { cacheName });
    return response.data as CacheClearResult;
  },

  async clearAll(): Promise<CacheClearResult> {
    const response = await typedClient.post('/api/v1/admin/cache/clear-all', undefined);
    return response.data as CacheClearResult;
  },

  async getLogs(page: number = 0, size: number = 20): Promise<CacheClearLog[]> {
    const response = await typedClient.get('/api/v1/admin/cache/logs', {
      params: { page, size }
    });
    return response.data as CacheClearLog[];
  },
};
