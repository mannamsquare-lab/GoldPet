/**
 * Location Service
 * Handles location updates and reverse geocoding
 */

import apiClient from './api/client';

export const locationService = {
  /**
   * Update user's main location
   */
  updateMyLocation: async (lat: number, lng: number, text: string) => {
    const response = await apiClient.put('/users/me', {
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
    const response = await apiClient.get(`/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
    return { address: response.data.address, province: response.data.province ?? null };
  },

  /**
   * Forward geocode address to coordinates
   */
  geocode: async (address: string): Promise<Array<{
    address: string;
    lat: number;
    lng: number;
  }>> => {
    const response = await apiClient.get(`/maps/geocode?address=${encodeURIComponent(address)}`);
    return response.data.results;
  }
};
