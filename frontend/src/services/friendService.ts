import { apiClient } from './api/client';

export interface Friend {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  petName: string;
  petBreed: string;
  petAge: number;
  petGender: 'MALE' | 'FEMALE';
  isNeutered: boolean;
  onWalking: boolean; // walking status from UI
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

export const friendService = {
  getFriends: async (filter?: string): Promise<Friend[]> => {
    // Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
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
            location: { lat: 37.5665, lng: 126.9780 },
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
            location: { lat: 37.5670, lng: 126.9790 },
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
            distance: 1200, // 1.2km
            status: 'offline',
            location: { lat: 37.5650, lng: 126.9800 },
          },
        ]);
      }, 600);
    });
  },

  searchFriends: async (query: string): Promise<Friend[]> => {
    // Simple mock search
    const allFriends = await friendService.getFriends();
    return allFriends.filter(f => 
      f.nickname.includes(query) || 
      f.petName.includes(query) ||
      f.petBreed.includes(query)
    );
  }
};
