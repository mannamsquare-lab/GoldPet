import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Zoom } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import '../WalkPhotoDetail.css';
import { walkService } from '../../../services/walkService';
import type { PageResponse, WalkPhotoItem } from '../../../services/walkService';
import { reportService } from '../../../services/reportService';
import { useToast } from '../../../contexts/ToastContext';
import { ReportModal } from '../../../components/common/ReportModal';
import {
  mapArrayRemoveItemById,
  mapArrayUpdateItemById,
  mapPagesRemoveItemById,
  mapPagesUpdateItemById,
} from '../utils/photoQueryCache';
import { useDeepLinkPhoto } from '../hooks/useDeepLinkPhoto';
import { useShare } from '../../share/useShare';
import { useAuthStore } from '../../../stores/authStore';

type Props = {
  variant: 'page' | 'modal';
  mode: 'owned' | 'shared';
  walkId: number;
  initialSpotId: number;
  initialPhoto?: WalkPhotoItem | null;
  onClose?: () => void;
  onRequestPath?: (path: string) => void;
};

const WINDOW_HALF = 1;  // 활성 슬라이드 좌우 N장을 DOM에 유지 (전체 2N+1장 = 3장)

// 만료된 presigned URL 감지 시 React Query 무효화를 분당 1회로 제한하는 모듈-스코프 타임스탬프.
// 컴포넌트 마운트/언마운트와 무관하게 전역으로 디바운스한다.
let lastPresignedInvalidateMs = 0;
const PRESIGNED_INVALIDATE_DEBOUNCE_MS = 10_000;

function formatDate(isoStr: string | undefined | null): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function buildPath(mode: 'owned' | 'shared', walkId: number, spotId: number): string {
  return mode === 'owned'
    ? `/walk-photos/${walkId}/${spotId}`
    : `/walk-shared-photos/${walkId}/${spotId}`;
}

type SlideProps = {
  photo: WalkPhotoItem;
  active?: boolean;  // 활성 ±N 윈도우 안에 있을 때만 true — 그 외는 blob 리졸브 skip하여 iOS WKWebView 메모리 보호
  /** presigned URL 만료(4xx) 감지 시 호출 — 상위에서 React Query 무효화 처리 */
  onPresignedUrlExpired?: () => void;
};

function WalkPhotoViewerSlide({ photo, active = true, onPresignedUrlExpired }: SlideProps) {
  // 윈도우 밖 슬라이드(active=false)는 placeholder만 렌더 — <img> 미마운트로 iOS 메모리 보호.
  // 백엔드 Option A 이후 photo.imageUrl은 HTTPS presigned URL; WKWebView 네이티브 이미지 캐시가
  // 디코딩·메모리를 직접 관리한다 (blob URL 불필요).
  if (!active || !photo.imageUrl) {
    return <div className="swiper-zoom-container"><div className="wpv_slide_placeholder" /></div>;
  }
  return (
    <div className="swiper-zoom-container">
      <img
        src={photo.imageUrlViewer ?? photo.imageUrl}
        alt=""
        className="wpv_slide_img"
        crossOrigin="anonymous"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // presigned URL 만료(403) 또는 클록 스큐(400 RequestTimeTooSkewed) 감지:
          // <img>는 HTTP 상태 코드를 노출하지 않으므로 URL에 X-Amz-Signature= 포함 여부로 판별.
          // 조건 충족 시 피드 쿼리를 무효화하여 다음 렌더 시 서버에서 신규 URL을 발급받는다.
          const src = (e.currentTarget as HTMLImageElement).src;
          if (src.includes('X-Amz-Signature=')) {
            onPresignedUrlExpired?.();
          }
        }}
        draggable={false}
      />
    </div>
  );
}

export function WalkPhotoGalleryViewer({
  variant,
  mode,
  walkId,
  initialSpotId,
  initialPhoto,
  onClose,
  onRequestPath,
}: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { share } = useShare();
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const swiperRef = useRef<SwiperType | null>(null);

  const {
    initialPhoto: resolvedInitial,
    photos,
    initialIndex: feedInitialIndex,
    allowSwipe,
    empty,
    loading,
    fetchNextPage,
    hasNextPage,
  } = useDeepLinkPhoto({
    walkId,
    spotId: initialSpotId,
    mode,
    photoFromState: initialPhoto ?? null,
  });

  const [activeIndex, setActiveIndex] = useState(feedInitialIndex);
  const hasHydratedRef = useRef(false);

  // 1회 hydration: photos 배열이 [photoFromState] → 전체 feed로 바뀌는 시점에
  // Swiper를 초기 클릭 사진 위치로 이동 (이후 페이지 prefetch로 photos 증가해도 재이동 X)
  useEffect(() => {
    if (hasHydratedRef.current) return;
    if (photos.length <= 1) return;
    if (feedInitialIndex <= 0) {
      // 0번 슬라이드라면 이동 불필요, 다만 hydrated로 고정하여 이후 재이동 방지
      hasHydratedRef.current = true;
      return;
    }
    hasHydratedRef.current = true;
    try {
      swiperRef.current?.slideTo(feedInitialIndex, 0, false);
    } catch { /* ignore */ }
    setActiveIndex(feedInitialIndex);
  }, [photos.length, feedInitialIndex]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<string>(initialPhoto?.note ?? '');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const currentPhoto: WalkPhotoItem | null = useMemo(() => {
    if (photos.length > 0) return photos[activeIndex] ?? photos[0] ?? null;
    return resolvedInitial;
  }, [photos, activeIndex, resolvedInitial]);

  // Prefetch ±2 (window 밖 1칸) 슬라이드의 viewer URL로 HTTP 캐시 예열.
  // `<img>` 로 DOM에 마운트하지 않고 `new Image()` 로 네이티브 디코더 바이패스 →
  // WKWebView가 response만 저장. 실제 swipe 시 `<img src>` 마운트 → 즉시 hit.
  // WINDOW_HALF=1 이라 현재 마운트된 ±1 너머의 ±2만 예열 대상.
  useEffect(() => {
    if (photos.length <= 1) return;
    const prefetchIndices = [activeIndex + 2, activeIndex - 2];
    const imgs: HTMLImageElement[] = [];
    for (const idx of prefetchIndices) {
      if (idx < 0 || idx >= photos.length) continue;
      const p = photos[idx];
      const url = p.imageUrlViewer ?? p.imageUrl;
      if (!url) continue;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.src = url;
      imgs.push(img);
    }
    return () => {
      // href 해제로 GC를 돕되, WKWebView의 HTTP response cache는 src unset 해도 유지됨.
      for (const img of imgs) img.src = '';
    };
  }, [activeIndex, photos]);

  useEffect(() => {
    setDraft(currentPhoto?.note ?? '');
  }, [currentPhoto?.id, currentPhoto?.walkId, currentPhoto?.note]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const modules = useMemo(() => [Navigation, Keyboard, Zoom], []);

  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  /**
   * presigned URL 만료 감지 시 피드 쿼리를 무효화한다.
   * 모듈-스코프 타임스탬프로 분당 1회만 실행 (오프라인→온라인 전환 시 폭풍 방지).
   */
  const handlePresignedUrlExpired = useCallback(() => {
    const now = Date.now();
    if (now - lastPresignedInvalidateMs < PRESIGNED_INVALIDATE_DEBOUNCE_MS) return;
    lastPresignedInvalidateMs = now;
    void queryClient.invalidateQueries({ queryKey: ['walk', mode, 'photos'] });
  }, [queryClient, mode]);

  const handleShare = useCallback(async () => {
    if (!currentPhoto?.imageUrl) return;
    // share/compose always uses full-resolution original
    await share({
      kind: 'walk-photo',
      photoUrl: currentPhoto.imageUrl,
      walkId: currentPhoto.walkId,
      spotId: currentPhoto.id,
      watermark: false,
    });
  }, [share, currentPhoto]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    else if (variant === 'modal') navigate(-1);
    else navigate(mode === 'owned' ? '/walk-photos' : '/walk-shared-photos');
  }, [onClose, variant, mode, navigate]);

  const applyCacheNotePatch = useCallback(
    (spotId: number, note: string | null) => {
      queryClient.setQueryData<InfiniteData<PageResponse<WalkPhotoItem>> | undefined>(
        ['walk', 'my', 'photos'],
        (old) => mapPagesUpdateItemById(old, spotId, { note }),
      );
      queryClient.setQueryData<PageResponse<WalkPhotoItem> | undefined>(
        ['walk', 'my', 'photos', 'mywalk-collection'],
        (old) => mapArrayUpdateItemById(old, spotId, { note }),
      );
    },
    [queryClient],
  );

  const applyCacheHiddenPatch = useCallback(
    (spotId: number, hidden: boolean) => {
      queryClient.setQueryData<InfiniteData<PageResponse<WalkPhotoItem>> | undefined>(
        ['walk', 'my', 'photos'],
        (old) => mapPagesUpdateItemById(old, spotId, { hiddenFromPublic: hidden }),
      );
      queryClient.setQueryData<PageResponse<WalkPhotoItem> | undefined>(
        ['walk', 'my', 'photos', 'mywalk-collection'],
        (old) => mapArrayUpdateItemById(old, spotId, { hiddenFromPublic: hidden }),
      );
    },
    [queryClient],
  );

  const removeFromSharedCache = useCallback(
    (spotId: number) => {
      queryClient.setQueryData<InfiniteData<PageResponse<WalkPhotoItem>> | undefined>(
        ['walk', 'public', 'photos'],
        (old) => mapPagesRemoveItemById(old, spotId),
      );
      queryClient.setQueryData<PageResponse<WalkPhotoItem> | undefined>(
        ['walk', 'public', 'photos', 'collection'],
        (old) => mapArrayRemoveItemById(old, spotId),
      );
    },
    [queryClient],
  );

  const handleSaveCaption = useCallback(
    async (newNote: string) => {
      if (mode !== 'owned' || !currentPhoto) return;
      const trimmed = newNote.trim();
      const nextNote = trimmed.length > 0 ? trimmed : null;
      const prevNote = currentPhoto.note ?? null;
      if (nextNote === prevNote) return;
      const targetWalkId = currentPhoto.walkId;
      const targetSpotId = currentPhoto.id;

      applyCacheNotePatch(targetSpotId, nextNote);
      try {
        await walkService.updateSpotNote(targetWalkId, targetSpotId, nextNote);
      } catch {
        applyCacheNotePatch(targetSpotId, prevNote);
        showToast('캡션 저장에 실패했어요. 다시 시도해주세요.', 'error');
      }
    },
    [mode, currentPhoto, applyCacheNotePatch, showToast],
  );

  const handleHide = useCallback(async () => {
    if (mode !== 'owned' || !currentPhoto) return;
    const targetWalkId = currentPhoto.walkId;
    const targetSpotId = currentPhoto.id;

    applyCacheHiddenPatch(targetSpotId, true);
    removeFromSharedCache(targetSpotId);
    try {
      await walkService.updateSpotVisibility(targetWalkId, targetSpotId, true);
    } catch {
      applyCacheHiddenPatch(targetSpotId, false);
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos', 'collection'], refetchType: 'all' });
      showToast('숨김 처리에 실패했어요', 'error');
    }
  }, [mode, currentPhoto, applyCacheHiddenPatch, removeFromSharedCache, queryClient, showToast]);

  const handleReportSubmit = useCallback(async (reason: string) => {
    if (!currentPhoto) return;
    setIsReportSubmitting(true);
    try {
      await reportService.createReport({ type: 'WALK_SPOT', targetId: currentPhoto.id, reason });
      setShowReportModal(false);
      showToast('신고가 접수되었습니다.', 'success');
    } catch {
      setShowReportModal(false);
      showToast('신고 접수에 실패했습니다.', 'error');
    } finally {
      setIsReportSubmitting(false);
    }
  }, [currentPhoto, showToast]);

  const handleUnhide = useCallback(async () => {
    if (mode !== 'owned' || !currentPhoto) return;
    const targetWalkId = currentPhoto.walkId;
    const targetSpotId = currentPhoto.id;

    applyCacheHiddenPatch(targetSpotId, false);
    try {
      await walkService.updateSpotVisibility(targetWalkId, targetSpotId, false);
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos', 'collection'], refetchType: 'all' });
    } catch {
      applyCacheHiddenPatch(targetSpotId, true);
      showToast('공개 처리에 실패했어요', 'error');
    }
  }, [mode, currentPhoto, applyCacheHiddenPatch, queryClient, showToast]);

  if (empty && !currentPhoto) {
    const listPath = mode === 'owned' ? '/walk-photos' : '/walk-shared-photos';
    return (
      <div className="wpv_root">
        <div className="wpv_top_meta">
          <div className="wpv_top_left">
            <button type="button" className="wpv_nav_btn" onClick={handleClose} aria-label="닫기">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="wpv_empty" role="alert">
          <svg
            className="wpv_empty_icon"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="22" cy="28" r="4" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M10 44L24 32L36 42L46 34L54 42"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12L52 52"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="wpv_empty_title">사진을 찾을 수 없어요</p>
          <p className="wpv_empty_desc">
            삭제되었거나 비공개로 전환된 사진일 수 있어요.
            {'\n'}네트워크 상태를 확인한 뒤 다시 시도해 주세요.
          </p>
          <div className="wpv_empty_actions">
            <button
              type="button"
              className="wpv_empty_primary"
              onClick={() => navigate(listPath)}
            >
              목록으로 돌아가기
            </button>
            <button
              type="button"
              className="wpv_empty_secondary"
              onClick={handleClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !currentPhoto) {
    return (
      <div className="wpv_root">
        <div className="wpv_loading">불러오는 중…</div>
      </div>
    );
  }

  const displayPhotos = photos.length > 0 ? photos : currentPhoto ? [currentPhoto] : [];
  const totalCount = displayPhotos.length;
  const currentIndexDisplay = totalCount > 0 ? Math.min(activeIndex + 1, totalCount) : 0;
  const petName = currentPhoto?.petName ?? '';
  const dateText = formatDate(currentPhoto?.walkDate);
  const hiddenFromPublic = currentPhoto?.hiddenFromPublic ?? false;

  return (
    <div className="wpv_root">
      {/* Top meta */}
      <div className="wpv_top_meta">
        <div className="wpv_top_left">
          <button
            type="button"
            className="wpv_nav_btn"
            onClick={handleClose}
            aria-label={variant === 'modal' ? '닫기' : '뒤로'}
          >
            {variant === 'modal' ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <div className="wpv_meta_text">
            <span className="wpv_meta_date">{dateText}</span>
            {petName && <span className="wpv_meta_pet">{petName}</span>}
          </div>
        </div>
        <div className="wpv_top_right">
          {currentPhoto?.imageUrl && (
            <button
              type="button"
              className="wpv_nav_btn"
              onClick={() => void handleShare()}
              aria-label="공유"
            >
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path
                  d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 6l-4-4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2v14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {totalCount > 0 && (
            <span className="wpv_index_badge">
              {currentIndexDisplay}/{totalCount}
            </span>
          )}
          {mode === 'shared' && currentPhoto && currentPhoto.userId != null && currentPhoto.userId !== currentUserId && (
            <button
              type="button"
              className="wpv_nav_btn"
              onClick={() => setShowReportModal(true)}
              aria-label="신고"
            >
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {mode === 'owned' && (
            <div className="wpv_menu_wrap" ref={menuWrapRef}>
              <button
                type="button"
                className="wpv_menu_btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="더보기"
              >
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <circle cx="5" cy="12" r="1.5" fill="#fff" />
                  <circle cx="12" cy="12" r="1.5" fill="#fff" />
                  <circle cx="19" cy="12" r="1.5" fill="#fff" />
                </svg>
              </button>
              {menuOpen && (
                <div className="wpv_menu_dropdown" role="menu">
                  <button
                    type="button"
                    className="wpv_menu_item"
                    onClick={() => {
                      setMenuOpen(false);
                      if (hiddenFromPublic) void handleUnhide();
                      else void handleHide();
                    }}
                  >
                    {hiddenFromPublic ? '공개 갤러리에 다시 공개' : '공개 갤러리에서 숨기기'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        initialSlide={feedInitialIndex}
        className="wpv_swiper"
        modules={modules}
        slidesPerView={1}
        spaceBetween={0}
        zoom={{ maxRatio: 3, toggle: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        allowTouchMove={allowSwipe}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChangeTransitionStart={(s) => {
          (document.activeElement as HTMLElement | null)?.blur();
          // Swiper zoom 모듈이 slide remount/초기 transition 시 내부적으로 active el의
          // querySelector를 호출하다가 undefined에 접근해 throw하는 경우 있음 → 안전 가드
          try {
            if (s.zoom && s.slides && s.slides.length > 0 && s.slides[s.activeIndex]) {
              s.zoom.out();
            }
          } catch { /* ignore zoom reset errors during transition */ }
        }}
        onTouchMove={(s) => {
          try {
            if (s.zoom && s.zoom.scale > 1) s.zoom.out();
          } catch { /* ignore */ }
        }}
        onSlideChange={(s) => {
          setActiveIndex(s.activeIndex);
        }}
        onSlideChangeTransitionEnd={(s) => {
          const next = displayPhotos[s.activeIndex];
          if (!next) return;
          const path = buildPath(mode, next.walkId, next.id);
          if (onRequestPath) {
            onRequestPath(path);
          } else if (variant === 'page') {
            navigate(path, { replace: true });
          } else {
            window.history.replaceState(window.history.state, '', path);
          }
          if (s.activeIndex >= displayPhotos.length - 3 && hasNextPage) {
            fetchNextPage();
          }
        }}
      >
        {displayPhotos.map((photo, idx) => {
          // 윈도우 밖 슬라이드는 placeholder only (DOM은 유지되지만 이미지/zoom 리소스 X)
          const inWindow = Math.abs(idx - activeIndex) <= WINDOW_HALF;
          return (
            <SwiperSlide key={`${photo.walkId}-${photo.id}`}>
              {inWindow ? (
                <WalkPhotoViewerSlide
                  photo={photo}
                  active={true}
                  onPresignedUrlExpired={handlePresignedUrlExpired}
                />
              ) : (
                // 윈도우 밖: zoom-container 미포함. Swiper zoom 모듈이 iOS에서
                // 많은 슬라이드를 순회할 때 발생하는 크래시 완화.
                <div className="wpv_slide_placeholder" />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={(reason) => void handleReportSubmit(reason)}
        isSubmitting={isReportSubmitting}
      />

      {/* Bottom panel */}
      {currentPhoto && (
        <div className="wpv_bottom_panel">
          {mode === 'owned' ? (
            <div className="wpv_caption_box">
              <textarea
                className="wpv_caption_input"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 100))}
                placeholder="한마디를 남겨보세요"
                rows={2}
                onBlur={() => {
                  void handleSaveCaption(draft);
                }}
              />
              <span className="wpv_caption_counter">{draft.length}/100자</span>
            </div>
          ) : (
            currentPhoto.note && (
              <div className="wpv_caption_readonly">{currentPhoto.note}</div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default WalkPhotoGalleryViewer;
