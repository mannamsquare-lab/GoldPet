import { apiClient } from './api/client';

export interface HomeDataResponse {
  user: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
    point: number;
  };
  pet?: {
    id: number;
    name: string;
    imageUrl?: string;
    breed: string;
    age: number;
  };
  notifications: {
    hasUnread: boolean;
    count: number;
  };
  weather?: {
    temp: number;
    condition: string; // 'sunny' | 'cloudy' | 'rain' | 'snow'
    text: string;
  };
  recommendations: {
    id: number;
    name: string;
    description: string;
    distance: string;
    images: string[];
    isNeutered: boolean;
    gender: 'MALE' | 'FEMALE';
  }[];
}

export const homeService = {
  getHomeData: async (): Promise<HomeDataResponse> => {
    // Mock Data Fallback
    // In a real scenario, this would be: return apiClient.get('/home').then(res => res.data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 1,
            nickname: '지오',
            point: 1250,
            profileImageUrl: 'https://picsum.photos/200',
          },
          pet: {
            id: 101,
            name: 'Goldie',
            breed: 'Golden Retriever',
            age: 3,
            imageUrl: 'https://picsum.photos/300',
          },
          notifications: {
            hasUnread: true,
            count: 3,
          },
          weather: {
            temp: 24,
            condition: 'sunny',
            text: '산책하기 딱 좋은 날씨에요!',
          },
          recommendations: [
            {
              id: 1,
              name: '멍텅구리',
              description: '5개월 ∙ 코숏 치즈',
              distance: '1km 이내',
              images: ['/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png', '/assets/images/main/main_slide_img01.png'],
              isNeutered: true,
              gender: 'FEMALE',
            },
            {
              id: 2,
              name: '냥냥냥',
              description: '5개월 ∙ 코숏 치즈',
              distance: '1km 이내',
              images: ['/assets/images/main/main_slide_img02.png', '/assets/images/main/main_slide_img02.png'],
              isNeutered: true,
              gender: 'FEMALE',
            },
            {
              id: 3,
              name: '멍멍이',
              description: '5개월 ∙ 코숏 치즈',
              distance: '1km 이내',
              images: ['/assets/images/main/main_slide_img03.png', '/assets/images/main/main_slide_img03.png'],
              isNeutered: true,
              gender: 'MALE',
            }
          ]
        });
      }, 500);
    });
  },
};
