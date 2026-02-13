/**
 * Native Bridge 클라이언트
 * Flutter WebView와 통신하는 JavaScript Bridge 구현
 */

import type { BridgeMessage, BridgeResponse, NativeEventType } from './bridgeTypes';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

class NativeBridge {
  private pendingRequests = new Map<string, PendingRequest>();
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private isInitialized = false;

  constructor() {
    this.setupBridge();
  }

  private setupBridge() {
    // Flutter WebView에서 호출할 수 있는 전역 함수 등록
    // Flutter WebView에서 호출할 수 있는 전역 함수 등록
    // 기존 window.nativeBridge가 있으면 handleResponse만 연결하고, 없으면 생성
    const existingBridge = (window as any).nativeBridge || {};
    (window as any).nativeBridge = {
      ...existingBridge,
      handleResponse: (response: BridgeResponse) => {
        this.handleResponse(response);
      },
    };

    // 네이티브 이벤트 리스너
    window.addEventListener('nativeEvent', ((e: CustomEvent) => {
      const { type, data } = e.detail;
      this.emitEvent(type, data);
    }) as EventListener);

    // Flutter WebView의 window.postMessage() 수신
    window.addEventListener('message', (e: MessageEvent) => {
      // Flutter sendEventToReact 형식: { type: eventName, data: {...} }
      if (e.data && typeof e.data === 'object' && e.data.type) {
        this.emitEvent(e.data.type, e.data.data);
      }
    });

    this.isInitialized = true;
    console.log('NativeBridge initialized');
  }

  async callMethod(method: string, params?: Record<string, any>): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('NativeBridge not initialized');
    }

    const id = this.generateId();
    const message: BridgeMessage = {
      id,
      method,
      params,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Bridge call timeout: ${method}`));
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Flutter WebView의 JavaScript Channel 호출
      if ((window as any).NativeBridge) {
        (window as any).NativeBridge.postMessage(JSON.stringify(message));
      } else {
        clearTimeout(timeout);
        reject(new Error('NativeBridge channel not available'));
      }
    });
  }

  private handleResponse(response: BridgeResponse) {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.warn('No pending request found for id:', response.id);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.success) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error(response.error?.message || 'Unknown error'));
    }
  }

  onEvent(eventType: NativeEventType, callback: (data: any) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  private emitEvent(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setSystemBarColors(statusBarColor: string, navigationBarColor: string) {
    if (!this.isAvailable()) return;
    this.callMethod('setSystemBarColors', { statusBarColor, navigationBarColor })
      .catch((e) => console.warn('setSystemBarColors failed:', e));
  }

  isAvailable(): boolean {
    return this.isInitialized && !!(window as any).NativeBridge;
  }
}

export const nativeBridge = new NativeBridge();

