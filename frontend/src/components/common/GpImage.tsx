import { useCallback, useMemo, useState, type ImgHTMLAttributes } from 'react';

/**
 * T1-2 GpImage — 백엔드 variant 파이프라인(T1-1.x)이 공급하는 thumbnail/medium/viewer
 * URL 중 가장 적절한 variant 를 선택해 렌더링하는 공용 컴포넌트.
 *
 * ## 사용 예시
 * ```tsx
 * // 카드/아바타 목록 (썸네일 우선)
 * <GpImage
 *   src={friend.profileImageUrl}
 *   thumbnailSrc={friend.profileImageUrlThumbnail}
 *   variant="thumbnail"
 *   alt={friend.nickname}
 *   className="avatar"
 * />
 *
 * // 프로필 상세 (viewer)
 * <GpImage
 *   src={user.profileImageUrl}
 *   viewerSrc={user.profileImageUrlViewer}
 *   thumbnailSrc={user.profileImageUrlThumbnail}
 *   variant="viewer"
 *   loading="eager"
 *   fetchPriority="high"
 * />
 * ```
 *
 * ## fallback 체인
 * - variant="thumbnail" → thumbnailSrc → mediumSrc → viewerSrc → src
 * - variant="medium"    → mediumSrc    → thumbnailSrc → viewerSrc → src
 * - variant="viewer"    → viewerSrc    → mediumSrc → thumbnailSrc → src
 * - variant="auto"(def) → viewerSrc    → mediumSrc → thumbnailSrc → src
 *
 * variant 로드 실패(onError)시 체인의 다음 후보로 자동 전환. 모든 후보 소진 시 빈 img.
 *
 * ## 기본 성능 힌트
 * - `loading="lazy"` + `decoding="async"` 기본값.
 * - LCP 후보(첫 slide, hero)는 `loading="eager" decoding="sync" fetchPriority="high"` 명시.
 */

type Variant = 'thumbnail' | 'medium' | 'viewer' | 'auto';

export interface GpImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading' | 'decoding' | 'fetchPriority'> {
  /** 원본 URL — 항상 fallback 맨 끝. null/undefined 허용. */
  src: string | null | undefined;
  thumbnailSrc?: string | null;
  mediumSrc?: string | null;
  viewerSrc?: string | null;
  variant?: Variant;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  decoding?: ImgHTMLAttributes<HTMLImageElement>['decoding'];
  /** React 19 camelCase. `fetchpriority` 가 아닌 `fetchPriority` 사용. */
  fetchPriority?: 'high' | 'low' | 'auto';
}

function buildChain(
  variant: Variant,
  src: string | null | undefined,
  thumbnailSrc: string | null | undefined,
  mediumSrc: string | null | undefined,
  viewerSrc: string | null | undefined,
): string[] {
  const order: Array<string | null | undefined> = (() => {
    switch (variant) {
      case 'thumbnail':
        return [thumbnailSrc, mediumSrc, viewerSrc, src];
      case 'medium':
        return [mediumSrc, thumbnailSrc, viewerSrc, src];
      case 'viewer':
        return [viewerSrc, mediumSrc, thumbnailSrc, src];
      case 'auto':
      default:
        return [viewerSrc, mediumSrc, thumbnailSrc, src];
    }
  })();
  // 중복 URL 제거 (variant 가 원본과 동일한 fallback 을 내릴 때)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const candidate of order) {
    if (candidate && candidate.length > 0 && !seen.has(candidate)) {
      seen.add(candidate);
      result.push(candidate);
    }
  }
  return result;
}

export function GpImage({
  src,
  thumbnailSrc,
  mediumSrc,
  viewerSrc,
  variant = 'auto',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  alt = '',
  onError,
  ...rest
}: GpImageProps) {
  const chain = useMemo(
    () => buildChain(variant, src, thumbnailSrc, mediumSrc, viewerSrc),
    [variant, src, thumbnailSrc, mediumSrc, viewerSrc],
  );
  const [index, setIndex] = useState(0);

  const handleError = useCallback<NonNullable<ImgHTMLAttributes<HTMLImageElement>['onError']>>(
    (event) => {
      setIndex((prev) => (prev < chain.length - 1 ? prev + 1 : prev));
      onError?.(event);
    },
    [chain.length, onError],
  );

  if (chain.length === 0) {
    return null;
  }

  const currentSrc = chain[Math.min(index, chain.length - 1)];

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={handleError}
    />
  );
}

export default GpImage;
