/**
 * JavaScript Bridge 타입 정의
 * Flutter와 React 간 통신을 위한 메시지 프로토콜 타입
 */

export interface BridgeMessage {
  id: string;
  method: string;
  params?: Record<string, any>;
  timestamp: number;
}

export interface BridgeResponse {
  id: string;
  success: boolean;
  data?: any;
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
  | 'appStateChanged';

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
  // 파일
  | 'saveFile'
  | 'readFile'
  | 'deleteFile'
  // 앱 정보
  | 'getAppVersion'
  | 'getDeviceInfo'
  | 'openSettings';

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

