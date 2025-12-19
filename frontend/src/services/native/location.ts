/**
 * 위치 서비스 래퍼
 * 네이티브 위치 기능을 React에서 사용하기 위한 래퍼
 */

import { nativeBridge } from '../../bridge/nativeBridge';
import type { Location } from '../../bridge/bridgeTypes';

export class LocationService {
  private unsubscribe?: () => void;

  async requestPermission(): Promise<boolean> {
    try {
      const result = await nativeBridge.callMethod('requestLocationPermission');
      return result.granted === true;
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    try {
      const data = await nativeBridge.callMethod('getCurrentLocation');
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        speed: data.speed,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }

  async startTracking(callback: (location: Location) => void): Promise<void> {
    // 이벤트 리스너 등록
    this.unsubscribe = nativeBridge.onEvent('locationUpdated', (data) => {
      callback({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        speed: data.speed,
        timestamp: data.timestamp,
      });
    });

    try {
      await nativeBridge.callMethod('startLocationTracking', {
        interval: 1000, // 1초마다 업데이트
        accuracy: 'high',
      });
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  async stopTracking(): Promise<void> {
    try {
      await nativeBridge.callMethod('stopLocationTracking');
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    } finally {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = undefined;
      }
    }
  }
}

export const locationService = new LocationService();

