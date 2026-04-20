import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { walkService } from '../../../services/walkService';
import type { WalkPhotoItem } from '../../../services/walkService';
import { resolvePhotoUrl, getCachedPhotoUrl } from '../utils/photoUrlCache';
import { WalkPhotoGalleryModal } from '../viewer/WalkPhotoGalleryModal';

const MAX_PHOTOS = 8;

export function WalkPhotoCollection() {
  const navigate = useNavigate();
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [modalPhoto, setModalPhoto] = useState<WalkPhotoItem | null>(null);
  const dispatchedRef = useRef<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ['walk', 'public', 'photos', 'collection'],
    queryFn: () => walkService.getPublicPhotos({ page: 0, size: 32 }),
  });

  const photos: WalkPhotoItem[] = useMemo(
    () => (data?.content ?? []).filter((p) => !!p.imageUrl).slice(0, MAX_PHOTOS),
    [data],
  );

  useEffect(() => {
    const seedFromCache: Record<string, string> = {};
    photos.forEach((photo) => {
      const thumbUrl = photo.imageUrlThumb ?? photo.imageUrl;
      if (!thumbUrl) return;
      const key = thumbUrl;
      if (dispatchedRef.current.has(key)) return;
      dispatchedRef.current.add(key);
      const cached = getCachedPhotoUrl(key);
      if (cached) {
        seedFromCache[key] = cached;
        return;
      }
      resolvePhotoUrl(key)
        .then((url) => setResolvedUrls((prev) => ({ ...prev, [key]: url })))
        .catch(() => setResolvedUrls((prev) => ({ ...prev, [key]: '' })));
    });
    if (Object.keys(seedFromCache).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedUrls((prev) => ({ ...seedFromCache, ...prev }));
    }
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className="walk_photo_collection">
      <button
        type="button"
        className="walk_photo_collection_title"
        onClick={() => navigate('/walk-shared-photos')}
      >
        <span>산책 사진 모아보기</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="walk_photo_collection_grid">
        {photos.map((photo) => {
          const thumbUrl = photo.imageUrlThumb ?? photo.imageUrl;
          const src = thumbUrl ? resolvedUrls[thumbUrl] : '';
          return (
            <button
              key={photo.id}
              type="button"
              className="walk_photo_collection_item"
              onClick={() => setModalPhoto(photo)}
            >
              {src ? (
                <img src={src} alt="" loading="lazy" decoding="async" />
              ) : (
                <div className="walk_photo_collection_placeholder" />
              )}
            </button>
          );
        })}
      </div>

      {modalPhoto && (
        <WalkPhotoGalleryModal
          mode="shared"
          walkId={modalPhoto.walkId}
          initialSpotId={modalPhoto.id}
          initialPhoto={modalPhoto}
          onClose={() => setModalPhoto(null)}
        />
      )}
    </div>
  );
}
