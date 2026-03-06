/**
 * 카메라 및 사진 라이브러리 서비스 래퍼
 */

import { nativeBridge } from '../../bridge/nativeBridge';
import type { ImageResult } from '../../bridge/bridgeTypes';

export class CameraService {
  async requestCameraPermission(): Promise<boolean> {
    try {
      const result = await nativeBridge.callMethod('requestCameraPermission') as Record<string, unknown>;
      return result.granted === true;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }

  async requestPhotoPermission(): Promise<boolean> {
    try {
      const result = await nativeBridge.callMethod('requestPhotoPermission') as Record<string, unknown>;
      return result.granted === true;
    } catch (error) {
      console.error('Failed to request photo permission:', error);
      return false;
    }
  }

  async openCamera(options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }): Promise<ImageResult> {
    try {
      const result = await nativeBridge.callMethod('openCamera', options) as ImageResult;
      return {
        path: result.path,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType,
        base64: result.base64,
      };
    } catch (error) {
      console.error('Failed to open camera:', error);
      throw error;
    }
  }

  async openPhotoLibrary(options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }): Promise<ImageResult> {
    try {
      const result = await nativeBridge.callMethod('openPhotoLibrary', options) as ImageResult;
      return {
        path: result.path,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType,
        base64: result.base64,
      };
    } catch (error) {
      console.error('Failed to open photo library:', error);
      throw error;
    }
  }

  async pickImage(
    source: 'camera' | 'gallery',
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    }
  ): Promise<ImageResult> {
    if (source === 'camera') {
      return this.openCamera(options);
    } else {
      return this.openPhotoLibrary(options);
    }
  }
}

export const cameraService = new CameraService();

