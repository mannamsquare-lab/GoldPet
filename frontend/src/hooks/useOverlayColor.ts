import { useEffect } from 'react';
import { nativeBridge } from '../bridge/nativeBridge';

let overlayRefCount = 0;

/**
 * 오버레이 모달이 열릴 때 Flutter SafeArea 색상을 동기화하는 훅.
 * 레퍼런스 카운팅으로 스택 모달을 안전하게 처리합니다.
 *
 * @param isOpen - 오버레이가 열려있는지 여부
 * @param color - 상단 SafeArea 오버레이 색상 (기본값: '#000000')
 * @param bottomColor - 하단 SafeArea 색상 (미지정 시 color와 동일)
 */
export function useOverlayColor(isOpen: boolean, color = '#000000', bottomColor?: string): void {
  useEffect(() => {
    if (!isOpen) return;
    if (!nativeBridge.isAvailable()) return;

    overlayRefCount++;
    if (overlayRefCount === 1) {
      const params: Record<string, string> = { color };
      if (bottomColor) params.bottomColor = bottomColor;
      nativeBridge.callMethod('setOverlayColor', params).catch(() => {});
    }

    return () => {
      overlayRefCount--;
      if (overlayRefCount === 0) {
        nativeBridge.callMethod('clearOverlayColor').catch(() => {});
      }
    };
  }, [isOpen, color, bottomColor]);
}
