import { useQuery } from '@tanstack/react-query';
import { bannerService } from '../services/bannerService';
import type { PublicBannerResponse, PublicBannersResponse } from '../services/bannerService';

export type BannerPlacement = 'HOME' | 'CHAT' | 'WALK' | 'COMMUNITY';

const PLACEMENT_KEY_MAP: Record<BannerPlacement, keyof PublicBannersResponse> = {
  HOME: 'home',
  CHAT: 'chat',
  WALK: 'walk',
  COMMUNITY: 'community',
};

/**
 * BottomNav 4탭 공유 캐시 훅 — queryKey: ['banners']
 * select로 placement별 슬라이스만 반환. 요청은 탭 전체에서 1회.
 * data === undefined → 로딩 중 (미렌더), [] → 빈 배너 (null 렌더)
 */
export function usePlacementBanners(placement: BannerPlacement): PublicBannerResponse[] | undefined {
  const { data } = useQuery({
    queryKey: ['banners'],
    queryFn: bannerService.getPublicBanners,
    staleTime: 60_000,
    select: (banners) => banners[PLACEMENT_KEY_MAP[placement]],
  });
  return data;
}
