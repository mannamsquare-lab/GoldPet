import apiClient from './api/client';

// Interfaces
export interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  checkInCount: number;
}

export interface CheckIn {
  id: number;
  placeId: number;
  placeName: string;
  userId: number;
  nickname: string;
  checkInTime: string;
  memo: string | null;
}

export interface CreateCheckInRequest {
  placeId: number;
  memo?: string;
}

export interface CreatePlaceRequest {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

// Mock Data
const mockPlaces: Place[] = [
  {
    id: 1,
    name: '펫프렌즈 카페',
    description: '반려동물과 함께하는 편안한 카페',
    category: '카페',
    address: '서울시 강남구 테헤란로 123',
    latitude: 37.5012,
    longitude: 127.0396,
    imageUrl: null,
    checkInCount: 45,
  },
  {
    id: 2,
    name: '24시 우리동물병원',
    description: '24시간 응급 진료 가능',
    category: '동물병원',
    address: '서울시 강남구 역삼로 456',
    latitude: 37.5003,
    longitude: 127.0365,
    imageUrl: null,
    checkInCount: 32,
  },
  {
    id: 3,
    name: '반려동물 놀이터 공원',
    description: '넓은 잔디밭이 있는 반려동물 전용 공원',
    category: '공원',
    address: '서울시 강남구 봉은사로 789',
    latitude: 37.5089,
    longitude: 127.0452,
    imageUrl: null,
    checkInCount: 78,
  },
  {
    id: 4,
    name: '펫샵 프렌즈',
    description: '고품질 반려동물 용품 전문점',
    category: '반려동물용품점',
    address: '서울시 강남구 선릉로 321',
    latitude: 37.5045,
    longitude: 127.0412,
    imageUrl: null,
    checkInCount: 23,
  },
];

const mockCheckIns: CheckIn[] = [
  {
    id: 1,
    placeId: 1,
    placeName: '펫프렌즈 카페',
    userId: 1,
    nickname: '강아지집사',
    checkInTime: '2025-12-21T14:30:00',
    memo: '강아지들이 너무 좋아해요!',
  },
  {
    id: 2,
    placeId: 1,
    placeName: '펫프렌즈 카페',
    userId: 2,
    nickname: '고양이사랑',
    checkInTime: '2025-12-21T12:15:00',
    memo: null,
  },
  {
    id: 3,
    placeId: 3,
    placeName: '반려동물 놀이터 공원',
    userId: 1,
    nickname: '강아지집사',
    checkInTime: '2025-12-20T16:45:00',
    memo: '산책하기 정말 좋아요',
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Service
export const checkinService = {
  getNearbyPlaces: async (
    lat: number,
    lng: number,
    radiusMeters = 1000
  ): Promise<Place[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockPlaces;
    }

    try {
      const response = await apiClient.get('/checkin/places/nearby', {
        params: { latitude: lat, longitude: lng, radiusMeters },
      });
      return response.data;
    } catch {
      return mockPlaces;
    }
  },

  getPlaces: async (
    category?: string,
    page = 0,
    size = 20
  ): Promise<Place[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      if (category && category !== '전체') {
        return mockPlaces.filter((p) => p.category === category);
      }
      return mockPlaces;
    }

    try {
      const response = await apiClient.get('/checkin/places', {
        params: { category, page, size },
      });
      return response.data;
    } catch {
      return mockPlaces;
    }
  },

  getPlace: async (placeId: number): Promise<Place> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const place = mockPlaces.find((p) => p.id === placeId);
      if (!place) throw new Error('Place not found');
      return place;
    }

    try {
      const response = await apiClient.get(`/checkin/places/${placeId}`);
      return response.data;
    } catch (error) {
      const place = mockPlaces.find((p) => p.id === placeId);
      if (!place) throw error;
      return place;
    }
  },

  searchPlaces: async (
    name: string,
    page = 0,
    size = 20
  ): Promise<Place[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockPlaces.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    try {
      const response = await apiClient.get('/checkin/places/search', {
        params: { name, page, size },
      });
      return response.data;
    } catch {
      return mockPlaces.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  },

  createPlace: async (request: CreatePlaceRequest): Promise<Place> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const newPlace: Place = {
        id: mockPlaces.length + 1,
        ...request,
        imageUrl: request.imageUrl || null,
        checkInCount: 0,
      };
      return newPlace;
    }

    try {
      const response = await apiClient.post('/checkin/places', request);
      return response.data;
    } catch {
      const newPlace: Place = {
        id: mockPlaces.length + 1,
        ...request,
        imageUrl: request.imageUrl || null,
        checkInCount: 0,
      };
      return newPlace;
    }
  },

  checkIn: async (request: CreateCheckInRequest): Promise<CheckIn> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const place = mockPlaces.find((p) => p.id === request.placeId);
      const newCheckIn: CheckIn = {
        id: mockCheckIns.length + 1,
        placeId: request.placeId,
        placeName: place?.name || 'Unknown',
        userId: 1,
        nickname: '사용자',
        checkInTime: new Date().toISOString(),
        memo: request.memo || null,
      };
      return newCheckIn;
    }

    try {
      const response = await apiClient.post('/checkin', request);
      return response.data;
    } catch {
      const place = mockPlaces.find((p) => p.id === request.placeId);
      const newCheckIn: CheckIn = {
        id: mockCheckIns.length + 1,
        placeId: request.placeId,
        placeName: place?.name || 'Unknown',
        userId: 1,
        nickname: '사용자',
        checkInTime: new Date().toISOString(),
        memo: request.memo || null,
      };
      return newCheckIn;
    }
  },

  getMyCheckIns: async (page = 0, size = 20): Promise<CheckIn[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockCheckIns;
    }

    try {
      const response = await apiClient.get('/checkin/my', {
        params: { page, size },
      });
      return response.data;
    } catch {
      return mockCheckIns;
    }
  },

  getPlaceCheckIns: async (
    placeId: number,
    page = 0,
    size = 20
  ): Promise<CheckIn[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockCheckIns.filter((c) => c.placeId === placeId);
    }

    try {
      const response = await apiClient.get(
        `/checkin/places/${placeId}/checkins`,
        {
          params: { page, size },
        }
      );
      return response.data;
    } catch {
      return mockCheckIns.filter((c) => c.placeId === placeId);
    }
  },

  getCheckInCount: async (): Promise<number> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockCheckIns.length;
    }

    try {
      const response = await apiClient.get('/checkin/count');
      return response.data.count;
    } catch {
      return mockCheckIns.length;
    }
  },
};
