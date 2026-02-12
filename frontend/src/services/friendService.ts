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
  locationText?: string;
}

export interface Species {
  id: number;
  code: string;
  name: string;
  description: string;
  breedCount: number;
}

// Mock data


export const friendService = {
  getFriends: async (filterJson: string, page = 0, size = 20): Promise<{ content: Friend[], last: boolean }> => {
    try {
      const filters = JSON.parse(filterJson);
      const params = new URLSearchParams();
      
      if (filters.distance) params.append('distance', filters.distance);
      if (filters.sortOrder) params.append('sort', filters.sortOrder);
      if (filters.petTypes?.length) params.append('petTypes', filters.petTypes.join(','));
      if (filters.genders?.length) params.append('genders', filters.genders.join(','));
      
      // Add location params for distance-based search
      if (filters.lat) params.append('lat', filters.lat.toString());
      if (filters.lng) params.append('lng', filters.lng.toString());
      
      // Pagination
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await apiClient.get(`/friends?${params}`);
      return response.data;
    } catch (e) {
      console.error('Failed to fetch friends:', e);
      throw e;
    }
  },

  getNearbyFriends: async (lat: number, lng: number, radiusMeters = 5000): Promise<Friend[]> => {
    try {
      const response = await apiClient.get(`/friends/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
      return response.data;
    } catch (e) {
      console.error('Failed to fetch nearby friends:', e);
      return [];
    }
  },

  searchFriends: async (query: string): Promise<Friend[]> => {
    try {
      const response = await apiClient.get(`/friends/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch {
      return [];
    }
  },

  sendFriendRequest: async (userId: number): Promise<{ success: boolean }> => {
    try {
      await apiClient.post(`/friends/requests`, { targetUserId: userId });
      return { success: true };
    } catch {
      throw new Error('친구 요청에 실패했습니다.');
    }
  },

  acceptFriendRequest: async (requestId: number): Promise<{ success: boolean }> => {
    try {
      await apiClient.post(`/friends/requests/${requestId}/accept`);
      return { success: true };
    } catch {
      throw new Error('친구 수락에 실패했습니다.');
    }
  },

  rejectFriendRequest: async (requestId: number): Promise<{ success: boolean }> => {
    try {
      await apiClient.post(`/friends/requests/${requestId}/reject`);
      return { success: true };
    } catch {
      throw new Error('친구 거절에 실패했습니다.');
    }
  },

  removeFriend: async (friendId: number): Promise<{ success: boolean }> => {
    try {
      await apiClient.delete(`/friends/${friendId}`);
      return { success: true };
    } catch {
      throw new Error('친구 삭제에 실패했습니다.');
    }
  },

  getSpecies: async (): Promise<Species[]> => {
    try {
        const response = await apiClient.get('/pets/species');
        return response.data;
    } catch {
        return [];
    }
  },

  // Like a user (좋아요)
  likeUser: async (targetUserId: number): Promise<{ likeId: number; toUserId: number; isMutual: boolean }> => {
    try {
      const response = await apiClient.post(`/friends/${targetUserId}/like`);
      return response.data;
    } catch (e) {
      console.error('Failed to like user:', e);
      throw e;
    }
  },

  // Unlike/dislike a user (싫어요)
  unlikeUser: async (targetUserId: number): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete(`/friends/${targetUserId}/like`);
      return response.data;
    } catch (e) {
      console.error('Failed to unlike user:', e);
      throw e;
    }
  },

  // Reject a received like (거절)
  rejectLike: async (senderUserId: number): Promise<{ success: boolean }> => {
    try {
      await apiClient.delete(`/friends/likes/received/${senderUserId}`);
      return { success: true };
    } catch (e) {
      console.error('Failed to reject like:', e);
      throw e;
    }
  },

  // Get users I liked (내가 좋아해)
  getMyLikes: async (): Promise<Friend[]> => {
    try {
      const response = await apiClient.get('/friends/likes/my');
      return response.data;
    } catch (e) {
      console.error('Failed to get my likes:', e);
      return [];
    }
  },

  // Get mutual likes (서로 좋아해)
  getMutualLikes: async (): Promise<Friend[]> => {
    try {
      const response = await apiClient.get('/friends/likes/mutual');
      return response.data;
    } catch (e) {
      console.error('Failed to get mutual likes:', e);
      return [];
    }
  },

  // Get received likes (나를 좋아해)
  getReceivedLikes: async (): Promise<Friend[]> => {
    try {
      const response = await apiClient.get('/friends/likes/received');
      return response.data;
    } catch (e) {
      console.error('Failed to get received likes:', e);
      return [];
    }
  },


  // Check if I liked a user
  checkLikeStatus: async (targetUserId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/friends/${targetUserId}/like/status`);
      return response.data.hasLiked;
    } catch {
      return false;
    }
  },
};

export const PET_TAG_MAPPINGS: Record<string, string> = {
    // Activity
    'Activity:ENERGIZER': '에너자이저',
    'Activity:ACTIVE': '활발함',
    'Activity:NORMAL': '보통 활동량',
    'Activity:CALM': '얌전함',
    'Activity:STATIC': '매우 정적',
    
    // Friendliness
    'Friendliness:SOCIAL': '모두의 친구',
    'Friendliness:PEOPLE_ONLY': '사람 좋아함',
    'Friendliness:SELECTIVE': '선택적 친화',
    'Friendliness:SHY': '낯가림',
    'Friendliness:INDEPENDENT': '독립적',

    // Training
    'Training:PROFESSIONAL': '전문 교육 수료',
    'Training:BASIC': '기본 매너',
    'Training:TRAINING': '교육 중',
    'Training:FREE_SPIRIT': '자유로운 영혼',

    // Barking
    'Barking:VOCAL': '자주 짖음',
    'Barking:NECESSARY': '가끔 짖음',
    'Barking:QUIET': '조용함',

    // Toy
    'Toy:MANIA': '장난감 마니아',
    'Toy:LIKE': '장난감 좋아함',
    'Toy:NORMAL': '놀이 보통',
    'Toy:DISLIKE': '장난감 무관심',

    // Walk
    'Walk:ADDICTED': '산책 중독',
    'Walk:ENJOY': '산책 즐김',
    'Walk:MODERATE': '적당한 산책',
    'Walk:INDOOR': '실내파',

    // Petting
    'Petting:LOVER': '스킨십 중독',
    'Petting:LIKE': '스킨십 좋아함',
    'Petting:ACCEPT': '스킨십 허용',
    'Petting:PRIVATE': '터치 싫어함',

    // Friendship
    'Friendship:SOCIAL': '적극적 친구',
    'Friendship:MANNER': '매너 좋은',
    'Friendship:CAREFUL': '조심성 많음',
    'Friendship:LONER': '혼자가 편함',
    
    // Allergy (Only showing YES for consistency)
    'AllergyMeat:YES': '육류 알러지',
    'AllergyDairyEgg:YES': '유제품/알 알러지',
    'AllergyGrain:YES': '곡물 알러지',
    'AllergyOther:YES': '기타 알러지',
};

export const formatPetTag = (tag: string): string => {
    // Check direct match
    if (PET_TAG_MAPPINGS[tag]) return PET_TAG_MAPPINGS[tag];
    
    // Handle Note
    if (tag.startsWith('Note:')) return tag.substring(5);
    
    // Hide NO/UNKNOWN system tags
    if (tag.includes(':NO') || tag.includes(':UNKNOWN')) return '';
            
    // Fallback for legacy simple tags or custom tags
    return tag;
};

