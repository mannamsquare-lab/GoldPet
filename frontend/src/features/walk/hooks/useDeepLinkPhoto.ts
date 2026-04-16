import { useEffect, useLayoutEffect, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { walkService } from '../../../services/walkService';
import type { WalkPhotoItem, WalkSession, WalkSpot } from '../../../services/walkService';
import { useWalkPhotoFeed, type WalkPhotoFeedMode } from './useWalkPhotoFeed';

type UseDeepLinkPhotoParams = {
  walkId: number;
  spotId: number;
  mode: WalkPhotoFeedMode;
  photoFromState?: WalkPhotoItem | null;
  swiperRef: React.MutableRefObject<SwiperType | null>;
  deepLinkTimeoutMs?: number;
};

type UseDeepLinkPhotoResult = {
  initialPhoto: WalkPhotoItem | null;
  photos: WalkPhotoItem[];
  allowSwipe: boolean;
  empty: boolean;
  loading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
};

const MAX_TRACKB_PREFETCH_PAGES = 5;
const PAGE_SIZE = 20;

function isSlowNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  };
  const eff = nav.connection?.effectiveType;
  return eff === '2g' || eff === 'slow-2g' || nav.connection?.saveData === true;
}

function toPhotoItem(walk: WalkSession, spot: WalkSpot): WalkPhotoItem {
  return {
    id: spot.id ?? 0,
    imageUrl: spot.imageUrl ?? null,
    note: spot.note ?? null,
    walkDate: walk.startTime,
    walkId: walk.id,
    petName: walk.petNames?.[0] ?? null,
    petImageUrl: walk.petProfileImageUrls?.[0] ?? null,
    hiddenFromPublic: spot.hiddenFromPublic,
  };
}

export function useDeepLinkPhoto({
  walkId,
  spotId,
  mode,
  photoFromState,
  swiperRef,
  deepLinkTimeoutMs,
}: UseDeepLinkPhotoParams): UseDeepLinkPhotoResult {
  const [initialPhoto, setInitialPhoto] = useState<WalkPhotoItem | null>(photoFromState ?? null);
  const [photos, setPhotos] = useState<WalkPhotoItem[]>(
    photoFromState ? [photoFromState] : []
  );
  const [allowSwipe, setAllowSwipe] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [trackALoaded, setTrackALoaded] = useState<boolean>(!!photoFromState);

  const effectiveTimeoutMs = deepLinkTimeoutMs ?? (isSlowNetwork() ? 10_000 : 5_000);

  const {
    photos: photosFromFeed,
    fetchNextPage,
    hasNextPage: rqHasNextPage,
    isFetchingNextPage,
  } = useWalkPhotoFeed({ mode });

  const hasNextPage = !!rqHasNextPage;

  // trackA — 단건 즉시 확보 (이미 photoFromState 있으면 skip)
  useEffect(() => {
    if (initialPhoto || !walkId) {
      if (initialPhoto) setTrackALoaded(true);
      return;
    }
    let cancelled = false;
    walkService
      .getWalkDetail(Number(walkId))
      .then((walk) => {
        if (cancelled) return;
        const target =
          walk.spots?.find((s) => s.id === Number(spotId)) ??
          walk.spots?.find((s) => s.type === 'PHOTO');
        if (target?.imageUrl) {
          const photo = toPhotoItem(walk, target);
          setInitialPhoto(photo);
          setPhotos((prev) => (prev.length === 0 ? [photo] : prev));
          setTrackALoaded(true);
        } else {
          setEmpty(true);
        }
      })
      .catch(() => {
        // timeout guard will handle
      });
    return () => {
      cancelled = true;
    };
  }, [walkId, spotId, initialPhoto]);

  // trackA 렌더 구간 — background prefetch (빈 피드인 경우만 첫 페이지)
  useEffect(() => {
    if (photosFromFeed.length === 0 && rqHasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [photosFromFeed.length, rqHasNextPage, isFetchingNextPage, fetchNextPage]);

  // trackB — 캐시 hydration (R2 race guard)
  useLayoutEffect(() => {
    if (photosFromFeed.length === 0) return;
    const idx = photosFromFeed.findIndex(
      (p) => p.id === Number(spotId) && p.walkId === Number(walkId)
    );
    if (idx < 0) {
      // 아직 캐시에 없음 → 최대 5페이지까지만 background prefetch (블로킹 금지)
      if (
        rqHasNextPage &&
        !isFetchingNextPage &&
        photosFromFeed.length < MAX_TRACKB_PREFETCH_PAGES * PAGE_SIZE
      ) {
        fetchNextPage();
      }
      return;
    }

    // 1) Virtual cache invalidate (동기)
    swiperRef.current?.virtual?.update(true);
    // 2) Jump to target index (no animation, 동기)
    swiperRef.current?.slideTo(idx, 0, false);
    // 3) photos 교체 (레퍼런스 동일하면 skip — 무한 루프 방지) + 잠금 해제
    setPhotos((prev) => (prev === photosFromFeed ? prev : photosFromFeed));
    setAllowSwipe((prev) => (prev ? prev : true));
  }, [photosFromFeed, walkId, spotId, rqHasNextPage, isFetchingNextPage, fetchNextPage, swiperRef]);

  // Timeout guard — trackA도 없고 empty 아니면 타임아웃 후 empty 처리
  useEffect(() => {
    if (initialPhoto || empty) return;
    const t = setTimeout(() => {
      setEmpty((prev) => (prev ? prev : true));
    }, effectiveTimeoutMs);
    return () => clearTimeout(t);
  }, [initialPhoto, empty, effectiveTimeoutMs]);

  const loading = !initialPhoto && !empty && !trackALoaded;

  return {
    initialPhoto,
    photos,
    allowSwipe,
    empty,
    loading,
    fetchNextPage,
    hasNextPage,
  };
}
