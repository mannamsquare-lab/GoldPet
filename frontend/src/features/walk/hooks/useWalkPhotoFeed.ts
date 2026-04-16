import { useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { walkService } from '../../../services/walkService';
import type { PageResponse, WalkPhotoItem } from '../../../services/walkService';

const PAGE_SIZE = 20;

export type WalkPhotoFeedMode = 'owned' | 'shared';

export function useWalkPhotoFeed({ mode }: { mode: WalkPhotoFeedMode }) {
  const queryKey = mode === 'owned'
    ? ['walk', 'my', 'photos'] as const
    : ['walk', 'public', 'photos'] as const;

  const q = useInfiniteQuery<PageResponse<WalkPhotoItem>, Error>({
    queryKey: queryKey as unknown as readonly unknown[],
    queryFn: ({ pageParam = 0 }) =>
      mode === 'owned'
        ? walkService.getMyPhotos({ page: pageParam as number, size: PAGE_SIZE })
        : walkService.getPublicPhotos({ page: pageParam as number, size: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    initialPageParam: 0,
  });

  const photos: WalkPhotoItem[] = useMemo(
    () => q.data?.pages.flatMap(p => p.content) ?? [],
    [q.data],
  );
  const findIndexBySpotId = useCallback(
    (spotId: number, walkId: number) => photos.findIndex(p => p.id === spotId && p.walkId === walkId),
    [photos],
  );

  return { ...q, photos, queryKey, findIndexBySpotId, pageSize: PAGE_SIZE };
}
