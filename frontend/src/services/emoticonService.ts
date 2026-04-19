import apiClient from './api/client';
import type { EmoticonResponse } from '../types/api';

// Generated alias (Phase 3.10).
export type Emoticon = EmoticonResponse;

export const emoticonService = {
  getEmoticons: async (): Promise<Emoticon[]> => {
    const response = await apiClient.get('/emoticons');
    return response.data;
  }
};
