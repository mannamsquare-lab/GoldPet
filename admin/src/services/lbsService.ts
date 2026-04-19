import { typedClient } from './typedClient';

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
    const response = await typedClient.get('/api/v1/admin/lbs/stats');
    return response.data as unknown as LBSStats;
  },

  async getPlaces(): Promise<Place[]> {
    const response = await typedClient.get('/api/v1/admin/lbs/places');
    return response.data as unknown as Place[];
  },

  async createPlace(data: { name: string; category: string; latitude: number; longitude: number }): Promise<Place> {
    const body = data as unknown as Parameters<typeof typedClient.post<'/api/v1/admin/lbs/places'>>[1];
    const response = await typedClient.post('/api/v1/admin/lbs/places', body);
    return response.data as unknown as Place;
  },
};
