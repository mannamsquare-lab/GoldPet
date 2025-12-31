// Gamification Service - API integration for Badges and Challenges

import apiClient from './api/client';

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  isEarned?: boolean;
  earnedAt?: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  goalType: 'WALK_DISTANCE_TOTAL' | 'CHECK_IN_COUNT';
  goalValue: number;
  rewardGold?: number;
  rewardBadgeId?: number;
  startDate: string;
  endDate: string;
  currentValue?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface UserChallengeProgress {
  challengeId: number;
  challenge: Challenge;
  currentValue: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  completedAt?: string;
}

// Mock data
const mockBadges: Badge[] = [
  { id: 1, code: 'FIRST_WALK', name: '첫 산책', description: '첫 산책을 완료했어요!', imageUrl: '/assets/images/badges/first_walk.png', isEarned: true, earnedAt: '2025-12-01' },
  { id: 2, code: 'WALK_10_DAYS', name: '10일 연속 산책', description: '10일 연속으로 산책했어요!', imageUrl: '/assets/images/badges/walk_10.png', isEarned: true, earnedAt: '2025-12-15' },
  { id: 3, code: 'WALK_30_DAYS', name: '30일 연속 산책', description: '30일 연속으로 산책했어요!', imageUrl: '/assets/images/badges/walk_30.png', isEarned: false },
  { id: 4, code: 'DISTANCE_100KM', name: '100km 달성', description: '총 100km를 걸었어요!', imageUrl: '/assets/images/badges/distance_100.png', isEarned: true, earnedAt: '2025-12-20' },
  { id: 5, code: 'FRIEND_10', name: '10명의 친구', description: '10명의 친구를 만들었어요!', imageUrl: '/assets/images/badges/friend_10.png', isEarned: false },
  { id: 6, code: 'COMMUNITY_FIRST', name: '첫 게시글', description: '커뮤니티에 첫 글을 작성했어요!', imageUrl: '/assets/images/badges/community.png', isEarned: true, earnedAt: '2025-12-10' },
];

const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: '12월 30km 걷기',
    description: '이번 달 총 30km를 걸어보세요!',
    goalType: 'WALK_DISTANCE_TOTAL',
    goalValue: 30,
    rewardGold: 500,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    currentValue: 22.5,
    status: 'IN_PROGRESS',
  },
  {
    id: 2,
    title: '일주일에 5번 산책',
    description: '이번 주에 5번 이상 산책하세요!',
    goalType: 'CHECK_IN_COUNT',
    goalValue: 5,
    rewardGold: 100,
    startDate: '2025-12-16',
    endDate: '2025-12-22',
    currentValue: 3,
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    title: '친구와 함께 산책',
    description: '친구와 함께 산책을 3번 해보세요!',
    goalType: 'CHECK_IN_COUNT',
    goalValue: 3,
    rewardGold: 200,
    rewardBadgeId: 10,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    currentValue: 1,
    status: 'IN_PROGRESS',
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

export const gamificationService = {
  getAllBadges: async (): Promise<Badge[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockBadges;
    }

    try {
      const response = await apiClient.get('/gamification/badges');
      return response.data;
    } catch {
      return mockBadges;
    }
  },

  getMyBadges: async (): Promise<Badge[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockBadges.filter((b) => b.isEarned);
    }

    try {
      const response = await apiClient.get('/gamification/my-badges');
      return response.data;
    } catch {
      return mockBadges.filter((b) => b.isEarned);
    }
  },

  getActiveChallenges: async (): Promise<Challenge[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockChallenges;
    }

    try {
      const response = await apiClient.get('/gamification/challenges');
      return response.data;
    } catch {
      return mockChallenges;
    }
  },

  getMyChallengeProgress: async (): Promise<UserChallengeProgress[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockChallenges.map((c) => ({
        challengeId: c.id,
        challenge: c,
        currentValue: c.currentValue || 0,
        status: c.status || 'NOT_STARTED',
      }));
    }

    try {
      const response = await apiClient.get('/gamification/my-challenges');
      return response.data;
    } catch {
      return [];
    }
  },

  joinChallenge: async (challengeId: number): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      console.log('Joining challenge (mock):', challengeId);
      return { success: true };
    }

    try {
      await apiClient.post(`/gamification/challenges/${challengeId}/join`);
      return { success: true };
    } catch {
      throw new Error('챌린지 참여에 실패했습니다.');
    }
  },
};
