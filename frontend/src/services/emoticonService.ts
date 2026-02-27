import apiClient from './api/client';

export interface Emoticon {
  id: number;
  name: string | null;
  category: string;
  imageUrl: string;
  sortOrder: number;
  packId: number;
}

export const emoticonService = {
  getEmoticons: async (): Promise<Emoticon[]> => {
    const response = await apiClient.get('/emoticons');
    return response.data;
  }
};
