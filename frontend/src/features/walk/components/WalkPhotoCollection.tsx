import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walkService } from '../../../services/walkService';
import type { WalkPhotoItem } from '../../../services/walkService';

async function resolvePhotoUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('http')) return imageUrl;
  const { default: apiClient } = await import('../../../services/api/client');
  const res = await apiClient.get(`/files/${imageUrl}/content`, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

const MAX_PHOTOS = 8;

export function WalkPhotoCollection() {
  const navigate = useNavigate();
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const blobUrlsRef = useRef<string[]>([]);

  const { data } = useQuery({
    queryKey: ['walk', 'my', 'photos', 'collection'],
    queryFn: () => walkService.getMyPhotos({ page: 0, size: 32 }),
  });

  const photos: WalkPhotoItem[] = (data?.content ?? [])
    .filter((p) => !!p.imageUrl)
    .slice(0, MAX_PHOTOS);

  useEffect(() => {
    photos.forEach((photo) => {
      if (!photo.imageUrl) return;
      const key = photo.imageUrl;
      if (resolvedUrls[key] !== undefined) return;
      resolvePhotoUrl(key)
        .then((url) => {
          if (url.startsWith('blob:')) blobUrlsRef.current.push(url);
          setResolvedUrls((prev) => ({ ...prev, [key]: url }));
        })
        .catch(() => {
          setResolvedUrls((prev) => ({ ...prev, [key]: '' }));
        });
    });
  }, [photos]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className="walk_photo_collection">
      <button
        type="button"
        className="walk_photo_collection_title"
        onClick={() => navigate('/walk-photos')}
      >
        <span>산책 사진 모아보기</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="walk_photo_collection_grid">
        {photos.map((photo) => {
          const src = photo.imageUrl ? resolvedUrls[photo.imageUrl] : '';
          return (
            <button
              key={photo.id}
              type="button"
              className="walk_photo_collection_item"
              onClick={() => navigate(`/walk-photos/${photo.walkId}/${photo.id}`)}
            >
              {src ? (
                <img src={src} alt="" loading="lazy" />
              ) : (
                <div className="walk_photo_collection_placeholder" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
