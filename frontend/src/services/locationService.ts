/**
 * Location Service
 * Handles location updates and reverse geocoding
 */

import { typedClient } from './api/typedClient';

export const locationService = {
  /**
   * Update user's main location
   */
  updateMyLocation: async (lat: number, lng: number, text: string) => {
    const response = await typedClient.put('/api/v1/users/me', {
      mainLocationText: text,
      mainLocationLat: lat,
      mainLocationLng: lng
    });
    return response.data;
  },

  /**
   * Reverse geocode coordinates to address + province
   */
  reverseGeocode: async (lat: number, lng: number): Promise<{ address: string; province: string | null }> => {
    const response = await typedClient.get('/api/v1/maps/reverse-geocode', { params: { lat, lng } });
    const data = response.data as { address: string; province?: string | null };
    return { address: data.address, province: data.province ?? null };
  },

  /**
   * Forward geocode address to coordinates
   */
  geocode: async (address: string): Promise<Array<{
    address: string;
    lat: number;
    lng: number;
  }>> => {
    const response = await typedClient.get('/api/v1/maps/geocode', { params: { address } });
    return (response.data as { results: Array<{ address: string; lat: number; lng: number }> }).results;
  }
};
