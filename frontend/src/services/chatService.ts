import { apiClient } from './api/client';

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
  }[];
  isGroup: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

export const chatService = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'room-1',
            name: '강아지조아',
            lastMessage: '산책 같이 가요!',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            unreadCount: 2,
            isGroup: false,
            participants: [
              { id: 1, nickname: '강아지조아', profileImageUrl: 'https://picsum.photos/201' }
            ]
          },
          {
            id: 'room-2',
            name: '주말 산책 모임',
            lastMessage: '이번 주 토요일 2시 어떠세요?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            unreadCount: 0,
            isGroup: true,
            participants: [
              { id: 2, nickname: '고양이집사' },
              { id: 3, nickname: '산책러' }
            ]
          }
        ]);
      }, 400);
    });
  },

  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'msg-1',
            roomId,
            senderId: 2, // Other user
            content: '안녕하세요!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            type: 'text',
          },
          {
            id: 'msg-2',
            roomId,
            senderId: 1, // Me
            content: '반갑습니다~',
            timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
            type: 'text',
          },
          {
            id: 'msg-3',
            roomId,
            senderId: 2,
            content: '오늘 산책 가시나요?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            type: 'text',
          }
        ]);
      }, 300);
     });
  },

  sendMessage: async (roomId: string, content: string): Promise<ChatMessage> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: `msg-${Date.now()}`,
                roomId,
                senderId: 1, // Assume current user ID is 1
                content,
                timestamp: new Date().toISOString(),
                type: 'text'
            });
        }, 200);
    });
  }
};
