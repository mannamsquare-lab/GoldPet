import { useQuery } from '@tanstack/react-query';
import type { PageResponse } from '../types/api';

/**
 * Query key convention:
 * - List queries: [resource, 'list', params]
 * - Detail queries: [resource, 'detail', id]
 *
 * Cache invalidation: mutations use queryClient.invalidateQueries({ queryKey: [resource] })
 * to invalidate both list and detail caches.
 */

interface UsePagedQueryOptions<T> {
  queryKey: string;
  fetchFn: (params: { page: number; size: number; [key: string]: unknown }) => Promise<PageResponse<T>>;
  page: number;
  size: number;
  filters?: Record<string, unknown>;
  enabled?: boolean;
}

export function usePagedQuery<T>({ queryKey, fetchFn, page, size, filters = {}, enabled = true }: UsePagedQueryOptions<T>) {
  return useQuery({
    queryKey: [queryKey, 'list', { page, size, ...filters }],
    queryFn: () => fetchFn({ page, size, ...filters }),
    enabled,
    placeholderData: (prev) => prev,
  });
}
