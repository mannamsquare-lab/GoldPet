import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Thumbs, Virtual, Zoom } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/virtual';
import 'swiper/css/thumbs';
import '../WalkPhotoDetail.css';
import { walkService } from '../../../services/walkService';
import type { PageResponse, WalkPhotoItem } from '../../../services/walkService';
import { reportService } from '../../../services/reportService';
import { useToast } from '../../../contexts/ToastContext';
import { ReportModal } from '../../../components/common/ReportModal';
import { getCachedPhotoUrl, resolvePhotoUrl, revokeOutsideWindow } from '../utils/photoUrlCache';
import {
  mapArrayRemoveItemById,
  mapArrayUpdateItemById,
  mapPagesRemoveItemById,
  mapPagesUpdateItemById,
} from '../utils/photoQueryCache';
import { useDeepLinkPhoto } from '../hooks/useDeepLinkPhoto';
import { useShare } from '../../share/useShare';

type Props = {
  variant: 'page' | 'modal';
  mode: 'owned' | 'shared';
  walkId: number;
  initialSpotId: number;
  initialPhoto?: WalkPhotoItem | null;
  onClose?: () => void;
  onRequestPath?: (path: string) => void;
};

const VIRTUAL_THRESHOLD = 30;
const THUMBS_THRESHOLD = 50;

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
};

function WalkPhotoViewerSlide({ photo }: SlideProps) {
  const initialUrl = photo.imageUrl ? getCachedPhotoUrl(photo.imageUrl) ?? null : null;
  const [resolved, setResolved] = useState<string | null>(initialUrl);

  useEffect(() => {
    if (!photo.imageUrl) {
      setResolved(null);
      return;
    }
    const cached = getCachedPhotoUrl(photo.imageUrl);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    resolvePhotoUrl(photo.imageUrl)
      .then((url) => {
        if (!cancelled) setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setResolved(null);
      });
    return () => {
      cancelled = true;
    };
  }, [photo.imageUrl]);

  return (
    <div className="swiper-zoom-container">
      {resolved ? (
        <img
          src={resolved}
          alt=""
          className="wpv_slide_img"
          onError={() => setResolved(null)}
          draggable={false}
        />
      ) : (
        <div className="wpv_slide_placeholder" />
      )}
    </div>
  );
}

function WalkPhotoThumbSlide({ photo }: SlideProps) {
  const initialUrl = photo.imageUrl ? getCachedPhotoUrl(photo.imageUrl) ?? null : null;
  const [resolved, setResolved] = useState<string | null>(initialUrl);

  useEffect(() => {
    if (!photo.imageUrl) {
      setResolved(null);
      return;
    }
    const cached = getCachedPhotoUrl(photo.imageUrl);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    resolvePhotoUrl(photo.imageUrl)
      .then((url) => {
        if (!cancelled) setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setResolved(null);
      });
    return () => {
      cancelled = true;
    };
  }, [photo.imageUrl]);

  return (
    <div className="wpv_thumb_cell">
      {resolved ? (
        <img src={resolved} alt="" className="wpv_thumb_img" draggable={false} />
      ) : (
        <div className="wpv_thumb_placeholder" />
      )}
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
  const swiperRef = useRef<SwiperType | null>(null);

  const {
    initialPhoto: resolvedInitial,
    photos,
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
    swiperRef,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<string>(initialPhoto?.note ?? '');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const currentPhoto: WalkPhotoItem | null = useMemo(() => {
    if (photos.length > 0) return photos[activeIndex] ?? photos[0] ?? null;
    return resolvedInitial;
  }, [photos, activeIndex, resolvedInitial]);

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

  const useVirtual = photos.length > VIRTUAL_THRESHOLD;
  const showThumbs = photos.length > THUMBS_THRESHOLD;
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const modules = useMemo(() => {
    return [
      Navigation,
      Keyboard,
      Zoom,
      ...(useVirtual ? [Virtual] : []),
      ...(showThumbs ? [Thumbs] : []),
    ];
  }, [useVirtual, showThumbs]);

  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      const list = photosRef.current;
      if (list.length === 0) return;
      const activeIdx = swiperRef.current?.activeIndex ?? 0;
      const keep = new Set<string>();
      const start = Math.max(0, activeIdx - 5);
      const end = Math.min(list.length - 1, activeIdx + 5);
      for (let i = start; i <= end; i++) {
        const key = list[i]?.imageUrl;
        if (key && !key.startsWith('http')) keep.add(key);
      }
      revokeOutsideWindow(keep);
    };
  }, []);

  const handleShare = useCallback(async () => {
    if (!currentPhoto?.imageUrl) return;
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
          {mode === 'shared' && currentPhoto && (
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
        className="wpv_swiper"
        modules={modules}
        slidesPerView={1}
        spaceBetween={0}
        zoom={{ maxRatio: 3, toggle: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        virtual={useVirtual ? { enabled: true } : false}
        thumbs={showThumbs && thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
        allowTouchMove={allowSwipe}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChangeTransitionStart={(s) => {
          (document.activeElement as HTMLElement | null)?.blur();
          s.zoom?.out();
        }}
        onTouchMove={(s) => {
          if (s.zoom && s.zoom.scale > 1) s.zoom.out();
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
        {displayPhotos.map((photo, index) => (
          <SwiperSlide key={`${photo.walkId}-${photo.id}`} virtualIndex={useVirtual ? index : undefined}>
            <WalkPhotoViewerSlide photo={photo} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbs strip (photos.length > 50) */}
      {showThumbs && (
        <Swiper
          className="wpv_thumbs_swiper"
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView="auto"
          spaceBetween={4}
          watchSlidesProgress
          freeMode
        >
          {displayPhotos.map((photo) => (
            <SwiperSlide key={`thumb-${photo.walkId}-${photo.id}`} className="wpv_thumb_slide">
              <WalkPhotoThumbSlide photo={photo} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

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
                placeholder="산책 사진에 한마디를 남겨보세요"
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
