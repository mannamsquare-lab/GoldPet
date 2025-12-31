// Notification Service - API integration for Notifications

import apiClient from './api/client';

export interface Notification {
  id: number;
  type: 'CHAT' | 'FRIEND_REQUEST' | 'COMMUNITY' | 'WALK' | 'BADGE' | 'CHALLENGE' | 'SYSTEM';
  title: string;
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'CHAT',
    title: '새 메시지',
    message: '강아지조아님이 메시지를 보냈습니다.',
    imageUrl: '/assets/images/main/main_slide_img01.png',
    linkUrl: '/chat/room-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    type: 'FRIEND_REQUEST',
    title: '친구 요청',
    message: '멍멍이맘님이 친구 요청을 보냈습니다.',
    imageUrl: '/assets/images/main/main_slide_img02.png',
    linkUrl: '/friend-list',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    type: 'COMMUNITY',
    title: '댓글 알림',
    message: '내 게시글에 새 댓글이 달렸습니다.',
    linkUrl: '/community/1',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 4,
    type: 'BADGE',
    title: '🏅 새 뱃지 획득!',
    message: '"10일 연속 산책" 뱃지를 획득했어요!',
    linkUrl: '/my-badges',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 5,
    type: 'CHALLENGE',
    title: '🎯 챌린지 완료!',
    message: '"일주일에 5번 산책" 챌린지를 완료했습니다!',
    linkUrl: '/challenges',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

export const notificationService = {
  getNotifications: async (page = 0, size = 20): Promise<{ notifications: Notification[]; hasMore: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { notifications: mockNotifications, hasMore: false };
    }

    try {
      const response = await apiClient.get(`/notifications?page=${page}&size=${size}`);
      return {
        notifications: response.data.content || response.data,
        hasMore: !response.data.last,
      };
    } catch {
      return { notifications: mockNotifications, hasMore: false };
    }
  },

  getUnreadCount: async (): Promise<number> => {
    if (USE_MOCK) {
      return mockNotifications.filter((n) => !n.isRead).length;
    }

    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log('Marking notification as read (mock):', notificationId);
      return;
    }

    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async (): Promise<void> => {
    if (USE_MOCK) {
      console.log('Marking all notifications as read (mock)');
      return;
    }

    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // Ignore
    }
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log('Deleting notification (mock):', notificationId);
      return;
    }

    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch {
      throw new Error('알림 삭제에 실패했습니다.');
    }
  },
};
