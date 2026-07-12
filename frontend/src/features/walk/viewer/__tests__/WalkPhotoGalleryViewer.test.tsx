import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalkPhotoGalleryViewer, WalkPhotoViewerSlide } from '../WalkPhotoGalleryViewer';
import { makePhotosWithVariants } from './fixtures';

// CSS — suppress module resolution in jsdom
vi.mock('../WalkPhotoDetail.css', () => ({}));
vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/navigation', () => ({}));
vi.mock('swiper/css/zoom', () => ({}));

// Swiper — render children directly; no DOM API requirements in jsdom
vi.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));
vi.mock('swiper/modules', () => ({ Navigation: {}, Keyboard: {}, Zoom: {} }));

// useDeepLinkPhoto — vi.hoisted so the mock fn is available in the factory
const { mockUseDeepLinkPhoto } = vi.hoisted(() => ({
  mockUseDeepLinkPhoto: vi.fn(),
}));
// Path resolved from THIS file (__tests__/): ../../hooks = src/features/walk/hooks
vi.mock('../../hooks/useDeepLinkPhoto', () => ({
  useDeepLinkPhoto: mockUseDeepLinkPhoto,
}));

// Remaining dependencies — paths resolved from __tests__/ directory
vi.mock('../../../../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock('../../../share/useShare', () => ({
  useShare: () => ({ share: vi.fn() }),
}));
vi.mock('../../../../stores/authStore', () => ({
  useAuthStore: () => null,
}));
vi.mock('../../../../services/reportService', () => ({
  reportService: { createReport: vi.fn() },
}));
vi.mock('../../utils/photoQueryCache', () => ({
  mapArrayRemoveItemById: vi.fn((d: unknown) => d),
  mapArrayUpdateItemById: vi.fn((d: unknown) => d),
  mapPagesRemoveItemById: vi.fn((d: unknown) => d),
  mapPagesUpdateItemById: vi.fn((d: unknown) => d),
}));

function renderViewer(initialIndex = 10) {
  const photos = makePhotosWithVariants(50);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <WalkPhotoGalleryViewer
          variant="page"
          mode="owned"
          walkId={1}
          initialSpotId={photos[initialIndex].id}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('WalkPhotoGalleryViewer', () => {
  beforeEach(() => {
    const photos = makePhotosWithVariants(50);
    mockUseDeepLinkPhoto.mockReturnValue({
      initialPhoto: photos[10],
      photos,
      initialIndex: 10,
      allowSwipe: true,
      empty: false,
      loading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    });
  });

  // EXACTLY-3 regression guard: WINDOW_HALF=1 means only slides [idx-1, idx, idx+1]
  // are in the active window regardless of total photo count → exactly 3 <img> mount.
  it('mounts exactly 3 img elements regardless of photo count', async () => {
    const { container } = renderViewer();
    await waitFor(() => {
      const imgs = container.querySelectorAll('img.wpv_slide_img');
      expect(imgs).toHaveLength(3);
    });
  });

  // Viewer src policy (iOS 메모리 누적 방어): 기본 표시는 600px medium 변형을 사용한다.
  // 줌하지 않은 슬라이드는 절대 1600px viewer 나 원본을 로드하지 않는다.
  it('uses medium URL by default (not viewer/original) when imageUrlMedium is present', async () => {
    const { container } = renderViewer();
    await waitFor(() => {
      expect(container.querySelectorAll('img.wpv_slide_img').length).toBeGreaterThan(0);
    });
    const imgs = container.querySelectorAll('img.wpv_slide_img');
    imgs.forEach((img) => {
      const src = img.getAttribute('src') ?? '';
      expect(src).toMatch(/_medium\.jpg/);
      expect(src).not.toMatch(/_viewer\.jpg/);
    });
  });

  // Share always uses full-resolution original — guard the share button is present.
  it('renders share button when imageUrl is present', async () => {
    const { container } = renderViewer();
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="공유"]')).not.toBeNull();
    });
  });
});

describe('WalkPhotoViewerSlide zoom swap', () => {
  const photo = makePhotosWithVariants(1)[0];

  it('loads medium src when not zoomed', () => {
    const { container } = render(<WalkPhotoViewerSlide photo={photo} active zoomed={false} />);
    const src = container.querySelector('img.wpv_slide_img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/_medium\.jpg/);
    expect(src).not.toMatch(/_viewer\.jpg/);
  });

  it('swaps to 1600px viewer src when zoomed', () => {
    const { container } = render(<WalkPhotoViewerSlide photo={photo} active zoomed />);
    const src = container.querySelector('img.wpv_slide_img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/_viewer\.jpg/);
    expect(src).not.toMatch(/_medium\.jpg/);
  });

  it('falls back to viewer then original when medium is absent', () => {
    const noMedium = { ...photo, imageUrlMedium: undefined };
    const { container } = render(<WalkPhotoViewerSlide photo={noMedium} active zoomed={false} />);
    const src = container.querySelector('img.wpv_slide_img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/_viewer\.jpg/);
  });
});
