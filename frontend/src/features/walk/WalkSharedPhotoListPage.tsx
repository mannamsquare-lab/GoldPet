import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BottomNav } from '../../components/common/BottomNav';
import { walkService } from '../../services/walkService';
import type { WalkPhotoItem } from '../../services/walkService';
import './WalkSharedPhotoList.css';

async function resolvePhotoUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('http')) return imageUrl;
  const { default: apiClient } = await import('../../services/api/client');
  const res = await apiClient.get(`/files/${imageUrl}/content`, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

export default function WalkSharedPhotoListPage() {
  const navigate = useNavigate();
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['walk', 'public', 'photos'],
    queryFn: ({ pageParam = 0 }) => walkService.getPublicPhotos({ page: pageParam as number, size: 24 }),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });

  const photos = data?.pages.flatMap(p => p.content) ?? [];

  // Resolve photo URLs
  useEffect(() => {
    photos.forEach((photo: WalkPhotoItem) => {
      if (!photo.imageUrl) return;
      const key = photo.imageUrl;
      if (resolvedUrls[key] !== undefined) return;
      resolvePhotoUrl(key)
        .then(url => {
          if (url.startsWith('blob:')) blobUrlsRef.current.push(url);
          setResolvedUrls(prev => ({ ...prev, [key]: url }));
        })
        .catch(() => {
          setResolvedUrls(prev => ({ ...prev, [key]: '' }));
        });
    });
  }, [photos]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Infinite scroll
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div className="wspl_page">
      {/* Header */}
      <div className="wspl_header">
        <button type="button" className="wspl_back_btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="#614108" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="wspl_header_title">산책 사진 모아보기</span>
      </div>

      {/* Photo grid */}
      <div className="wspl_content">
        {photos.length === 0 && !isFetchingNextPage && (
          <div className="wspl_empty">
            <span>공유된 산책 사진이 없습니다.</span>
          </div>
        )}
        <div className="wspl_grid">
          {photos.map((photo: WalkPhotoItem) => {
            const url = photo.imageUrl ? resolvedUrls[photo.imageUrl] : undefined;
            return (
              <div
                key={`${photo.walkId}-${photo.id}`}
                className="wspl_photo_cell"
                onClick={() => navigate(`/walk-shared-photos/${photo.walkId}/${photo.id}`, { state: photo })}
              >
                {url ? (
                  <img src={url} alt="" className="wspl_photo_img" />
                ) : (
                  <div className="wspl_photo_placeholder" />
                )}
              </div>
            );
          })}
        </div>
        {isFetchingNextPage && (
          <p className="wspl_loading">불러오는 중...</p>
        )}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      <BottomNav />
    </div>
  );
}
