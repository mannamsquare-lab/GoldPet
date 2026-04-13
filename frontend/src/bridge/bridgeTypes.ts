/**
 * JavaScript Bridge 타입 정의
 * Flutter와 React 간 통신을 위한 메시지 프로토콜 타입
 */

export interface BridgeMessage {
  id: string;
  method: string;
  params?: Record<string, unknown>;
  timestamp: number;
}

export interface BridgeResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export type NativeEventType =
  | 'pushNotificationReceived'
  | 'pushNotificationClicked'
  | 'locationUpdated'
  | 'permissionStatusChanged'
  | 'appStateChanged'
  | 'authExpired'
  | 'tokenSync'
  | 'walkCompleted';

export type NativeMethod =
  // 푸시 알림
  | 'requestPushPermission'
  | 'getPushToken'
  | 'subscribeToTopic'
  // 위치
  | 'requestLocationPermission'
  | 'getCurrentLocation'
  | 'startLocationTracking'
  | 'stopLocationTracking'
  // 카메라/사진
  | 'requestCameraPermission'
  | 'requestPhotoPermission'
  | 'openCamera'
  | 'openPhotoLibrary'
  | 'pickImage'
  // 앱 정보
  | 'getAppVersion'
  | 'getDeviceInfo'
  // 권한 일괄 요청
  | 'requestAllPermissions';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

export interface ImageResult {
  path: string;
  name: string;
  size: number;
  mimeType: string;
  base64?: string;
}

