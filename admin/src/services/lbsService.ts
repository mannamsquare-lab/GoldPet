import { apiClient } from './apiClient';

export interface LBSStats {
  totalWalks: number;
  todayWalks: number;
  totalDistance: number;
  avgDuration: number;
  topSpots: { id: number; name: string; visits: number }[];
}

export interface Place {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  visits: number;
  rating: number;
}

export const lbsService = {
  async getStats(): Promise<LBSStats> {
    const response = await apiClient.get('/lbs/stats');
    return response.data;
  },

  async getPlaces(): Promise<Place[]> {
    const response = await apiClient.get('/lbs/places');
    return response.data;
  },

  async createPlace(data: { name: string; category: string; latitude: number; longitude: number }): Promise<Place> {
    const response = await apiClient.post('/lbs/places', data);
    return response.data;
  },
};
