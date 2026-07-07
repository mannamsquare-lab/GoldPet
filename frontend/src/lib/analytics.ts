// GA4(gtag) 초기화 및 페이지뷰·이벤트 전송을 담당하는 분석 유틸
// VITE_GA_ID가 설정된 경우에만 활성화되고, 미설정 시 모든 함수가 no-op으로 동작한다.

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function isGAEnabled(): boolean {
  return typeof GA_ID === 'string' && GA_ID.startsWith('G-');
}

export function initGA4(): void {
  if (initialized || !isGAEnabled() || typeof document === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;
  gtag('js', new Date());
  // 초기 page_view는 자동 전송하고, SPA 화면 이동(라우트 변경)은
  // GA4 '향상된 측정'(브라우저 기록 이벤트)이 자동 집계한다. 중복 방지를 위해 수동 page_view는 두지 않는다.
  gtag('config', GA_ID);
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!isGAEnabled() || !window.gtag) return;
  window.gtag('event', name, params ?? {});
}
