import { useEffect } from 'react';
import { nativeBridge } from '../../bridge/nativeBridge';
import { useAuthStore } from '../../stores/authStore';

/**
 * Flutter에서 인증 만료(401 refresh 실패) 이벤트를 수신하여
 * React 측 로그아웃 + 로그인 페이지 이동을 처리하는 컴포넌트
 */
export function AuthExpiredHandler() {
  useEffect(() => {
    const unsubscribe = nativeBridge.onEvent('authExpired', () => {
      console.warn('[AuthExpiry] Received authExpired event from Flutter, logging out');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    });
    return unsubscribe;
  }, []);

  return null;
}
