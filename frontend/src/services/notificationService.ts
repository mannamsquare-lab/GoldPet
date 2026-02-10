// Notification Service - API integration for Notifications

import apiClient from './api/client';

export interface Notification {
  id: number;
  type: 'MATCH' | 'LIKE' | 'MESSAGE' | 'COMMENT' | 'FOLLOW' | 'WALK' | 'NOTICE' | 'EVENT' | 'SYSTEM';
  title: string;
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  targetId?: number;
  targetType?: string;
  isRead: boolean;
  createdAt: string;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'MESSAGE',
    title: '새 메시지',
    message: '강아지조아님이 메시지를 보냈습니다.',
    imageUrl: '/assets/images/main/main_slide_img01.png',
    linkUrl: '/chat/room-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    type: 'LIKE',
    title: '친구 요청',
    message: '멍멍이맘님이 좋아요를 보냈습니다.',
    imageUrl: '/assets/images/main/main_slide_img02.png',
    linkUrl: '/friend-list',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    type: 'COMMENT',
    title: '댓글 알림',
    message: '내 게시글에 새 댓글이 달렸습니다.',
    linkUrl: '/community/1',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

// Set USE_MOCK to false to use real API by default
const USE_MOCK = false;

export const notificationService = {
  getNotifications: async (category = 'ALL', page = 0, size = 20): Promise<{ notifications: Notification[]; hasMore: boolean }> => {
    if (USE_MOCK) {
      // Mock filtering could be added here if needed, but we focus on API
      await new Promise((r) => setTimeout(r, 400));
      return { notifications: mockNotifications as any, hasMore: false };
    }

    try {
      const response = await apiClient.get(`/notifications?category=${category}&page=${page}&size=${size}`);
      return {
        notifications: response.data.content || response.data,
        hasMore: !response.data.last,
      };
    } catch {
      return { notifications: [], hasMore: false };
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
