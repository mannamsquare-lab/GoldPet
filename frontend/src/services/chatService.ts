// Chat Service - API integration for Chat features

import apiClient from './api/client';

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

export interface FileInfo {
  id: number;
  url: string;
  fileType: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system';
  // API response fields
  textContent?: string;
  createdAt?: string;
  messageType?: string;
  fileId?: number;
  file?: FileInfo;
}

// Mock data
const mockRooms: ChatRoom[] = [
  {
    id: 'room-1',
    name: '강아지조아',
    lastMessage: '산책 같이 가요!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    isGroup: false,
    participants: [{ id: 2, nickname: '강아지조아', profileImageUrl: '/assets/images/temp/temp_dog_profile.png' }],
  },
  {
    id: 'room-2',
    name: '주말 산책 모임',
    lastMessage: '이번 주 토요일 2시 어떠세요?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 0,
    isGroup: true,
    participants: [
      { id: 3, nickname: '고양이집사' },
      { id: 4, nickname: '산책러' },
      { id: 5, nickname: '멍멍이맘' },
    ],
  },
];

const mockMessages: ChatMessage[] = [
  { id: 'msg-1', roomId: 'room-1', senderId: 2, content: '안녕하세요!', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: 'text' },
  { id: 'msg-2', roomId: 'room-1', senderId: 1, content: '반갑습니다~', timestamp: new Date(Date.now() - 1000 * 60 * 59).toISOString(), type: 'text' },
  { id: 'msg-3', roomId: 'room-1', senderId: 2, content: '오늘 산책 가시나요?', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'text' },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const chatService = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockRooms;
    }

    try {
      const response = await apiClient.get('/chat/rooms');
      return response.data;
    } catch {
      return mockRooms;
    }
  },

  getMessages: async (roomId: string, page = 0): Promise<ChatMessage[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return mockMessages.filter((m) => m.roomId === roomId || roomId);
    }

    try {
      const response = await apiClient.get(`/chat/rooms/${roomId}/messages?page=${page}`);
      return response.data.content || response.data;
    } catch {
      return mockMessages;
    }
  },

  sendMessage: async (
    roomId: string,
    content: string,
    options?: { messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'; fileId?: number }
  ): Promise<ChatMessage> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        id: `msg-${Date.now()}`,
        roomId,
        senderId: 1,
        content,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
    }

    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
        content: content || null,
        messageType: options?.messageType || 'TEXT',
        fileId: options?.fileId || null,
      });
      return response.data;
    } catch {
      throw new Error('메시지 전송에 실패했습니다.');
    }
  },

  uploadFile: async (file: File): Promise<{ id: number; url: string; fileType: string; mimeType: string }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: Date.now(),
        url: URL.createObjectURL(file),
        fileType: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'FILE',
        mimeType: file.type,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch {
      throw new Error('파일 업로드에 실패했습니다.');
    }
  },

  createRoom: async (participantIds: number[], name?: string): Promise<ChatRoom> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: `room-${Date.now()}`,
        name: name || '새 채팅',
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isGroup: participantIds.length > 1,
        participants: participantIds.map((id, i) => ({ id, nickname: `사용자${i + 1}` })),
      };
    }

    try {
      const response = await apiClient.post('/chat/rooms', { participantIds, name });
      return response.data;
    } catch {
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  markAsRead: async (roomId: string): Promise<void> => {
    if (USE_MOCK) return;

    try {
      await apiClient.post(`/chat/rooms/${roomId}/read`);
    } catch {
      // Ignore read marking errors
    }
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    if (USE_MOCK) {
      console.log('Left room (mock):', roomId);
      return;
    }

    try {
      await apiClient.delete(`/chat/rooms/${roomId}/leave`);
    } catch {
      throw new Error('채팅방 나가기에 실패했습니다.');
    }
  },

  /**
   * Get or create a direct chat room with a matched user.
   * Returns the chat room (existing or newly created).
   */
  getOrCreateDirectRoom: async (targetUserId: number): Promise<ChatRoom> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: `room-${Date.now()}`,
        name: '1:1 채팅',
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isGroup: false,
        participants: [{ id: targetUserId, nickname: '상대방' }],
      };
    }

    try {
      const response = await apiClient.post(`/chat/rooms/direct/${targetUserId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('매칭된 상대가 아닙니다.');
      }
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },
};
