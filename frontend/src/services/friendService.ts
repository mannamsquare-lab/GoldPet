// Friend Service - API integration for Friend features

import apiClient from './api/client';

export interface Friend {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  petName: string;
  petBreed: string;
  petAge: number;
  petGender: 'MALE' | 'FEMALE';
  isNeutered: boolean;
  onWalking: boolean;
  description: string;
  tags: string[];
  images: string[];
  distance: number; // meters
  status: 'online' | 'offline' | 'walking';
  location?: {
    lat: number;
    lng: number;
  };
}

// Mock data
const mockFriends: Friend[] = [
  {
    id: 1,
    nickname: '강아지조아',
    petName: '멍멍이',
    petBreed: 'Maltese',
    petAge: 2,
    petGender: 'MALE',
    isNeutered: true,
    onWalking: true,
    description: '엄청 활발하고 산책에 적극적인 아이랍니다! : )',
    tags: ['중성화 완료', '매우 활발함', '간식 금지', '친구 좋아함'],
    images: ['/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png'],
    distance: 150,
    status: 'walking',
    location: { lat: 37.5665, lng: 126.978 },
  },
  {
    id: 2,
    nickname: '고양이집사',
    petName: '나비',
    petBreed: 'Korean Shorthair',
    petAge: 1,
    petGender: 'FEMALE',
    isNeutered: false,
    onWalking: false,
    description: '조용한 산책을 선호해요',
    tags: ['조용함', '낯가림'],
    images: ['/assets/images/main/main_slide_img02.png'],
    distance: 500,
    status: 'online',
    location: { lat: 37.567, lng: 126.979 },
  },
  {
    id: 3,
    nickname: '산책러',
    petName: '해피',
    petBreed: 'Poodle',
    petAge: 3,
    petGender: 'FEMALE',
    isNeutered: true,
    onWalking: false,
    description: '같이 뛰는걸 좋아해요!',
    tags: ['에너지 넘침', '공놀이 좋아함'],
    images: ['/assets/images/main/main_slide_img03.png'],
    distance: 1200,
    status: 'offline',
    location: { lat: 37.565, lng: 126.98 },
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

export const friendService = {
  getFriends: async (filter?: string): Promise<Friend[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      if (filter === 'walking') {
        return mockFriends.filter((f) => f.onWalking);
      }
      return mockFriends;
    }

    try {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      const response = await apiClient.get(`/friends?${params}`);
      return response.data;
    } catch {
      return mockFriends;
    }
  },

  getNearbyFriends: async (lat: number, lng: number, radiusMeters = 5000): Promise<Friend[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockFriends.filter((f) => f.distance <= radiusMeters);
    }

    try {
      const response = await apiClient.get(`/friends/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
      return response.data;
    } catch {
      return mockFriends;
    }
  },

  searchFriends: async (query: string): Promise<Friend[]> => {
    if (USE_MOCK) {
      const allFriends = mockFriends;
      return allFriends.filter(
        (f) =>
          f.nickname.includes(query) || f.petName.includes(query) || f.petBreed.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await apiClient.get(`/friends/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch {
      return [];
    }
  },

  sendFriendRequest: async (userId: number): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      console.log('Friend request sent (mock):', userId);
      return { success: true };
    }

    try {
      await apiClient.post(`/friends/requests`, { targetUserId: userId });
      return { success: true };
    } catch {
      throw new Error('친구 요청에 실패했습니다.');
    }
  },

  acceptFriendRequest: async (requestId: number): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      console.log('Friend request accepted (mock):', requestId);
      return { success: true };
    }

    try {
      await apiClient.post(`/friends/requests/${requestId}/accept`);
      return { success: true };
    } catch {
      throw new Error('친구 수락에 실패했습니다.');
    }
  },

  rejectFriendRequest: async (requestId: number): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      console.log('Friend request rejected (mock):', requestId);
      return { success: true };
    }

    try {
      await apiClient.post(`/friends/requests/${requestId}/reject`);
      return { success: true };
    } catch {
      throw new Error('친구 거절에 실패했습니다.');
    }
  },

  removeFriend: async (friendId: number): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      console.log('Friend removed (mock):', friendId);
      return { success: true };
    }

    try {
      await apiClient.delete(`/friends/${friendId}`);
      return { success: true };
    } catch {
      throw new Error('친구 삭제에 실패했습니다.');
    }
  },
};
