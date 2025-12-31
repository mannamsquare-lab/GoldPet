import { apiClient } from './apiClient';

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrl: string | null;
  earnedCount: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  goalType: string;
  goalValue: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  completedCount: number;
}

export const gamificationService = {
  async getBadges(): Promise<Badge[]> {
    const response = await apiClient.get('/gamification/badges');
    return response.data;
  },

  async createBadge(data: { code: string; name: string; description: string; imageUrl?: string }): Promise<Badge> {
    const response = await apiClient.post('/gamification/badges', data);
    return response.data;
  },

  async getChallenges(): Promise<Challenge[]> {
    const response = await apiClient.get('/gamification/challenges');
    return response.data;
  },

  async createChallenge(data: {
    title: string;
    description: string;
    goalType: string;
    goalValue: number;
    startDate: string;
    endDate: string;
  }): Promise<Challenge> {
    const response = await apiClient.post('/gamification/challenges', data);
    return response.data;
  },
};
